import { isGASEnvironment } from './utils/is-gas-environment';
import { FunctionHost } from './classes/function-host';
import { GASPromises } from './classes/gas-promises';
import { ServerProxy } from './classes/server-proxy';
import { ServerConfig } from './types/config';
import { ServerFunctions, FunctionMap } from './types/functions';

class GASClient<FM extends FunctionMap = {}> {
  private _functionHost: FunctionHost<FM>;

  constructor(private _config?: ServerConfig) {
    if (isGASEnvironment()) {
      this._functionHost = new GASPromises();
    } else {
      this._functionHost = new ServerProxy(this._config);
    }
  }

  get serverFunctions(): ServerFunctions<FM> {
    return this._functionHost.serverFunctions;
  }
}

export { GASClient, ServerFunctions };
export { DevServerRequestEvent, GASDevServerIFrame } from './types/dev-server';
