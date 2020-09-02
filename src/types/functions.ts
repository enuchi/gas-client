export type ServerFunctionsMap = Record<string, (...args: any[]) => any>;

type Promisified<F extends (...args: any[]) => any> = (
  ...params: Parameters<F>
) => Promise<ReturnType<F>>;

type RecognizedServerFunctions<R extends ServerFunctionsMap> = {
  [Name in keyof R]: Promisified<R[Name]>;
};

type UnrecognizedServerFunctions = {
  [key: string]: (...args: any[]) => Promise<any>;
};

export type ServerFunctions<
  R extends ServerFunctionsMap
> = RecognizedServerFunctions<R> & UnrecognizedServerFunctions;
