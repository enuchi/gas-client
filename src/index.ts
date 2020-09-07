import isGASEnvironment from './utils/is-gas-environment';

import { FunctionHost } from './classes/function-host';
import { GASPromises } from './classes/gas-promises';
import { ServerProxy } from './classes/server-proxy';

import { ServerConfig } from './types/config';
import { ServerFunctions, FunctionMap } from './types/functions';

class GASClient<FM extends FunctionMap = {}> {
  private _functionHost: FunctionHost<FM>;

  /**
   * Accepts a single `config` object
   * @param {object} [_config] An optional config object for use in development.
   * @param {string|function} [config.allowedDevelopmentDomains] An optional config to specify which domains are permitted for communication with Google Apps Script Webpack Dev Server development tool. This is a security setting, and if not specified, this will block functionality in development. Will accept either a space-separated string of allowed subdomains, e.g. `https://localhost:3000 http://localhost:3000` (notice no trailing slash); or a function that takes in the requesting origin should return `true` to allow communication, e.g. `(origin) => /localhost:\d+$/.test(origin)`
   */
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
