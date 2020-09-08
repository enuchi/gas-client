import { v4 as uuidv4 } from 'uuid';

declare const window: AppWindow;

const proxyHandler = (target: unknown, functionName: string): ((...args: unknown[]) => Promise<unknown>) => {
  const id = uuidv4();
  const promise = new Promise((resolve, reject) => {
    // store the new Promise's resolve and reject
    window.gasStore[id] = { resolve, reject };
  });
  return (...args: unknown[]) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    window.parent.postMessage(
      {
        type: 'REQUEST',
        id,
        functionName,
        args: [...args],
      },
      // only send messages to our dev server, which should be running on the same origin
      window.location.origin
    );
    return promise;
  };
};

export { proxyHandler };
