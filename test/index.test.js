import { GASClient } from '../build';
import MockGoogleScriptRunClient from './__utils__/MockGoogleScriptRunClient';
import 'regenerator-runtime/runtime';

describe('google.script.run baseline', () => {
  beforeEach(() => {
    global.google = {
      script: {
        run: null,
      },
    };
  });

  test('should call success handler when call succeeds', () => {
    global.google.script.run = new MockGoogleScriptRunClient();

    const mockSuccessHandler = jest.fn();
    const mockFailureHandler = jest.fn();

    global.google.script.run
      .withSuccessHandler(mockSuccessHandler)
      .withFailureHandler(mockFailureHandler)
      .mySuccessfulServerFunction();

    expect(mockSuccessHandler).toHaveBeenCalled();
  });

  test('should call failure handler when call fails', () => {
    global.google.script.run = new MockGoogleScriptRunClient();

    const mockSuccessHandler = jest.fn();
    const mockFailureHandler = jest.fn();

    global.google.script.run
      .withSuccessHandler(mockSuccessHandler)
      .withFailureHandler(mockFailureHandler)
      .myFailedServerFunction();

    expect(mockFailureHandler).toHaveBeenCalled();
  });
});

describe('production gas-client server', () => {
  beforeEach(() => {
    global.google = {
      script: {
        run: null,
      },
    };

    jest.clearAllMocks();
  });

  test('should contain serverFunctions property', () => {
    const server = new GASClient();
    expect(server).toHaveProperty('serverFunctions');
  });

  test('should promisify server functions and resolve with successful call', async () => {
    global.google.script.run = new MockGoogleScriptRunClient();
    const server = new GASClient();

    const mockSuccessHandler = jest.fn();
    const mockFailureHandler = jest.fn();

    await server.serverFunctions
      .mySuccessfulServerFunction('arg1', 'arg2')
      .then(mockSuccessHandler)
      .catch(mockFailureHandler);

    expect.assertions(2);
    expect(mockSuccessHandler).toHaveBeenCalled();
    expect(mockFailureHandler).not.toHaveBeenCalled();
  });

  test('should promisify server functions and reject with failed call', async () => {
    global.google.script.run = new MockGoogleScriptRunClient();
    const server = new GASClient();

    const mockSuccessHandler = jest.fn();
    const mockFailureHandler = jest.fn();

    await server.serverFunctions
      .myFailedServerFunction('arg1', 'arg2')
      .then(mockSuccessHandler)
      .catch(mockFailureHandler);

    expect.assertions(2);
    expect(mockSuccessHandler).not.toHaveBeenCalled();
    expect(mockFailureHandler).toHaveBeenCalled();
  });
});

describe('local development gas-client server', () => {
  const eventHandlersStore = [];
  const originalWindowAddEventListener = window.addEventListener;
  beforeEach(() => {
    delete global.google;
    delete window.gasStore;
    jest.clearAllMocks();

    // keep track of window event listeners so we can remove them
    window.addEventListener = (...args) => {
      eventHandlersStore.push({ ...args });
      originalWindowAddEventListener(...args);
    };
  });

  afterEach(() => {
    // remove window event listeners after each test
    eventHandlersStore.forEach(({ 0: type, 1: handler }) => {
      window.removeEventListener(type, handler);
    });
    window.addEventListener = originalWindowAddEventListener;
  });

  test('should contain serverFunctions property', () => {
    const server = new GASClient();
    expect(server).toHaveProperty('serverFunctions');
  });

  describe('when set up properly', () => {
    test('should add gasStore to window', () => {
      expect(window).not.toHaveProperty('gasStore');
      new GASClient();
      expect(window).toHaveProperty('gasStore');
    });

    test('should add window event listener', () => {
      const mockAddEventListener = jest.fn();
      window.addEventListener = mockAddEventListener;

      new GASClient();
      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function), false);
    });

    test("should post message to window's parent when server function is called and store server function info in gasStore", () => {
      const mockPostMessage = jest.fn();
      window.parent.postMessage = mockPostMessage;

      const server = new GASClient();
      server.serverFunctions.someFunction('arg1', 'arg2');

      expect(Object.entries(window.gasStore).length).toEqual(1);
      expect(Object.entries(window.gasStore)[0][0]).toEqual(expect.stringMatching(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/));
      expect(Object.entries(window.gasStore)[0][1]).toEqual({
        resolve: expect.any(Function),
        reject: expect.any(Function),
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ['arg1', 'arg2'],
          functionName: 'someFunction',
          id: expect.stringMatching(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/), // just simple check this is a uuid
          type: 'REQUEST',
        }),
        '*'
      );
    });

    test("should default to post message to target origin of '*'", () => {
      const mockPostMessage = jest.fn();
      window.parent.postMessage = mockPostMessage;
      const defaultLocation = '*';

      const server = new GASClient({});
      server.serverFunctions.someFunction('arg1', 'arg2');

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ['arg1', 'arg2'],
          functionName: 'someFunction',
          id: expect.stringMatching(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/), // just simple check this is a uuid
          type: 'REQUEST',
        }),
        defaultLocation
      );
    });

    test('should successfully handle received message and resolve successful server function response', () => {
      const server = new GASClient({
        allowedDevelopmentDomains: 'https://localhost:3000',
      });

      server.serverFunctions.someFunction();
      const [uuid] = Object.entries(window.gasStore)[0];
      const mockResolve = jest.fn();
      const mockReject = jest.fn();

      // replace stored resolve/reject functions with mocks
      window.gasStore[uuid].resolve = mockResolve;
      window.gasStore[uuid].reject = mockReject;

      const eventBody = {
        data: {
          type: 'RESPONSE',
          response: "server function's response",
          status: 'SUCCESS',
          id: uuid,
        },
        origin: 'https://localhost:3000',
      };
      const messageEvent = new MessageEvent('message', eventBody);
      window.dispatchEvent(messageEvent);

      expect(mockResolve).toHaveBeenCalledWith("server function's response");
      expect(mockReject).not.toHaveBeenCalled();
    });

    test('should successfully handle received message and reject failed server function response', () => {
      const server = new GASClient({
        allowedDevelopmentDomains: 'https://localhost:3000',
      });

      server.serverFunctions.someFunction();
      const [uuid] = Object.entries(window.gasStore)[0];
      const mockResolve = jest.fn();
      const mockReject = jest.fn();

      // replace stored resolve/reject functions with mocks
      window.gasStore[uuid].resolve = mockResolve;
      window.gasStore[uuid].reject = mockReject;

      const eventBody = {
        data: {
          type: 'RESPONSE',
          response: new Error('there was an issue'),
          status: 'ERROR',
          id: uuid,
        },
        origin: 'https://localhost:3000',
      };
      const messageEvent = new MessageEvent('message', eventBody);
      window.dispatchEvent(messageEvent);

      expect(mockReject).toHaveBeenCalledWith(new Error('there was an issue'));

      // TODO: Update code to return with reject error
      expect(mockResolve).toHaveBeenCalledWith(new Error('there was an issue'));
    });

    describe('when using allowed development domains config', () => {
      const testSuccessfulServerCall = (
        { allowedDevelopmentDomains, origin, responseType = 'RESPONSE' },
        { shouldPass }
      ) => {
        const server = new GASClient({
          allowedDevelopmentDomains,
        });

        server.serverFunctions.someFunction();
        const [uuid] = Object.entries(window.gasStore)[0];
        const mockResolve = jest.fn();
        const mockReject = jest.fn();

        // replace stored resolve/reject functions with mocks
        window.gasStore[uuid].resolve = mockResolve;
        window.gasStore[uuid].reject = mockReject;

        const eventBody = {
          data: {
            type: responseType,
            response: "server function's response",
            status: 'SUCCESS',
            id: uuid,
          },
          origin,
        };
        const messageEvent = new MessageEvent('message', eventBody);
        window.dispatchEvent(messageEvent);

        if (shouldPass) {
          expect(mockResolve).toHaveBeenCalled();
        } else {
          expect(mockReject).not.toHaveBeenCalled();
          expect(mockResolve).not.toHaveBeenCalled();
        }
      };

      test('should resolve successfully when allowed development domains equals origin', () => {
        const allowedDevelopmentDomains = 'https://localhost:3000';
        const origin = 'https://localhost:3000';
        const shouldPass = true;

        testSuccessfulServerCall(
          {
            allowedDevelopmentDomains,
            origin,
          },
          { shouldPass }
        );
      });

      test("should not resolve successfully when allowed development domains doesn't equal origin", () => {
        const allowedDevelopmentDomains = 'https://localhost:8080';
        const origin = 'https://localhost:3000';
        const shouldPass = false;

        testSuccessfulServerCall(
          {
            allowedDevelopmentDomains,
            origin,
          },
          { shouldPass }
        );
      });

      test('should resolve successfully when allowed development domains string contains origin', () => {
        const allowedDevelopmentDomains = 'https://localhost:8080 https://localhost:3000';
        const origin = 'https://localhost:3000';
        const shouldPass = true;

        testSuccessfulServerCall(
          {
            allowedDevelopmentDomains,
            origin,
          },
          { shouldPass }
        );
      });

      test('should resolve successfully when allowed development domains function returns true for origin', () => {
        const allowedDevelopmentDomains = (origin) => /localhost:\d+$/.test(origin);
        const origin = 'https://localhost:3000';
        const shouldPass = true;

        testSuccessfulServerCall(
          {
            allowedDevelopmentDomains,
            origin,
          },
          { shouldPass }
        );
      });

      test('should not resolve successfully when allowed development domains function does not return true', () => {
        const allowedDevelopmentDomains = () => false;
        const origin = 'https://localhost:3000';
        const shouldPass = false;

        testSuccessfulServerCall(
          {
            allowedDevelopmentDomains,
            origin,
          },
          { shouldPass }
        );
      });

      test('should not resolve successfully when allowed development domains is undefined', () => {
        const allowedDevelopmentDomains = undefined;
        const origin = 'https://localhost:3000';
        const shouldPass = false;

        testSuccessfulServerCall(
          {
            allowedDevelopmentDomains,
            origin,
          },
          { shouldPass }
        );
      });

      test("should not resolve successfully when response type is not 'RESPONSE'", () => {
        const allowedDevelopmentDomains = 'https://localhost:3000';
        const origin = 'https://localhost:3000';
        const responseType = 'NOT RESPONSE';
        const shouldPass = false;

        testSuccessfulServerCall(
          {
            allowedDevelopmentDomains,
            origin,
            responseType,
          },
          { shouldPass }
        );
      });
    });
  });
});
