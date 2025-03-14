import { proxyHandlerScriptHostFunction } from '../utils/proxy-handler';
import { HostFunctions } from '../types/functions';
import { ScriptHostProvider } from './script-host-provider';

class ScriptHostProxy extends ScriptHostProvider {
  constructor() {
    super();
    this._hostFunctions = new Proxy({}, { get: proxyHandlerScriptHostFunction }) as HostFunctions;
  }
}

export { ScriptHostProxy };
