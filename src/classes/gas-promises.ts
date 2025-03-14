import { ignoredFunctionNames } from '../utils/ignored-function-names';
import { promisify } from '../utils/promisify';
import { FunctionProvider } from './function-provider';
import { FunctionMap, ServerFunctions } from '../types/functions';
import { google } from '../types/google';

class GASPromises<FM extends FunctionMap> extends FunctionProvider<FM> {
  constructor() {
    super();
    this.promisifyGASFunctions();
  }

  private promisifyGASFunctions(): void {
    this._serverFunctions = Object.keys(google.script.run).reduce(
      (acc, functionName) =>
        ignoredFunctionNames.includes(functionName)
          ? acc
          : {
              ...acc,
              [functionName]: promisify(functionName),
            },
      {}
    ) as ServerFunctions<FM>;
  }
}

export { GASPromises };
