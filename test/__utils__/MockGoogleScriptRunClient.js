/**
 * This class is a mock of the google.script.run client.
 *
 * It allows calling two "fake" server functions, one that results
 * in calling the success handler (`mySuccessfulServerFunction`)
 * and one that results in calling the error handler (`myFailedServerFunction`).
 */
export default class MockGoogleScriptRunClient {
  constructor() {
    return {
      // reserved functions
      withLogger: this.withLogger,
      withUserObject: this.withUserObject,
      withSuccessHandler: this.withSuccessHandler,
      withFailureHandler: this.withFailureHandler,

      // sample server functions
      mySuccessfulServerFunction: this.mySuccessfulServerFunction,
      myFailedServerFunction: this.myFailedServerFunction,
    };
  }

  withLogger() {
    return this;
  }

  withUserObject() {
    return this;
  }

  withSuccessHandler(cb) {
    this.successHandler = cb;
    return this;
  }

  withFailureHandler(cb) {
    this.failureHandler = cb;
    return this;
  }

  mySuccessfulServerFunction() {
    this.successHandler();
    return this;
  }

  myFailedServerFunction() {
    this.failureHandler();
    return this;
  }
}
