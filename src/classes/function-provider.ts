import { FunctionMap, ServerFunctions } from '../types/functions';

abstract class FunctionProvider<FM extends FunctionMap> {
  protected _serverFunctions: ServerFunctions<FM> = {} as ServerFunctions<FM>;

  get serverFunctions(): ServerFunctions<FM> {
    return this._serverFunctions;
  }
}

export { FunctionProvider };
