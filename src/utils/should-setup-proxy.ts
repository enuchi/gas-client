export default (err: Error): boolean =>
  err.message === 'google is not defined' &&
  process?.env.NODE_ENV === 'development';
