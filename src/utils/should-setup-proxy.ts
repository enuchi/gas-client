export default (err: Error): boolean =>
  err.toString() === 'ReferenceError: google is not defined' &&
  process?.env.NODE_ENV === 'development';
