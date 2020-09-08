import { ignoredFunctionNames } from '../utils/ignored-function-names';
import { promisify } from '../utils/promisify';
import { FunctionHost } from '../classes/function-host';
import { FunctionMap, ServerFunctions } from '../types/functions';

class GASPromises<FM extends FunctionMap> extends FunctionHost<FM> {
  constructor() {
    super();
    this.promisifyGASFunctions();
  }

  private promisifyGASFunctions(): void {
    // get the names of all of our publicly accessible server functions
    this._serverFunctions = Object.keys(google.script.run).reduce(
      (acc, functionName) =>
        // filter out the reserved names xx-- we don't want those
        ignoredFunctionNames.includes(functionName)
          ? acc
          : {
              ...acc,
              [functionName]: promisify(functionName),
            }, // attach Promise-based functions to the serverFunctions property
      {}
    ) as ServerFunctions<FM>;
  }
}

export { GASPromises };
