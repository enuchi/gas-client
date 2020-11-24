import Server from '../src/index';

describe('server instance in production', () => {
  global.google = {
    script: {
      run: {
        withFailureHandler: () => {},
        withLogger: () => {},
        withSuccessHandler: () => {},
        withUserObject: () => {},
      },
    },
  };

  test('should contain serverFunctions property', () => {
    const server = new Server();
    expect(server).toHaveProperty('serverFunctions');
  });
});
