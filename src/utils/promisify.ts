const promisify = (functionName: string) => {
  return (...args: unknown[]) =>
    new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](...args);
    });
};

export { promisify };
