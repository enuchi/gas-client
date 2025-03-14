import { HostFunctions } from '../types/functions';

abstract class ScriptHostProvider {
  protected _hostFunctions = {} as HostFunctions;

  get hostFunctions(): HostFunctions {
    return this._hostFunctions;
  }
}

export { ScriptHostProvider };
