import { isGASEnvironment } from './utils/is-gas-environment';
import { FunctionProvider } from './classes/function-provider';
import { GASPromises } from './classes/gas-promises';
import { ServerProxy } from './classes/server-proxy';
import { ServerConfig } from './types/config';
import { ServerFunctions, FunctionMap, HostFunctions } from './types/functions';
import { ScriptHostProvider } from './classes/script-host-provider';
import { ScriptHostFunctions } from './classes/host-functions';
import { ScriptHostProxy } from './classes/script-host-proxy';

class GASClient<FM extends FunctionMap = {}> {
  private _functionProvider: FunctionProvider<FM>;

  private _scriptHostProvider: ScriptHostProvider;

  constructor(private _config?: ServerConfig) {
    if (isGASEnvironment()) {
      this._functionProvider = new GASPromises();
      this._scriptHostProvider = new ScriptHostFunctions();
    } else {
      this._functionProvider = new ServerProxy(this._config);
      this._scriptHostProvider = new ScriptHostProxy();
    }
  }

  get serverFunctions(): ServerFunctions<FM> {
    return this._functionProvider.serverFunctions;
  }

  get scriptHostFunctions(): HostFunctions {
    return this._scriptHostProvider.hostFunctions;
  }
}

export { GASClient, ServerFunctions, HostFunctions };
export {
  DevServerRequestEvent,
  GASDevServerIFrame,
  MessageType,
  ResponseStatus,
  GASStore,
  DevServerRequest,
  DevServerResponse,
  DevServerContentWindow,
  AppWindow,
} from './types/dev-server';
