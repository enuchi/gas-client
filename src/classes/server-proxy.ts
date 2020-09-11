import { checkAllowList } from '../utils/check-allow-list';
import { proxyHandler } from '../utils/proxy-handler';
import { FunctionHost } from '../classes/function-host';
import { AppWindow } from '../types/dev-server';
import { FunctionMap, ServerFunctions } from '../types/functions';
import { ServerConfig } from '../types/config';

declare const window: AppWindow;

class ServerProxy<FM extends FunctionMap> extends FunctionHost<FM> {
  constructor(private _config?: ServerConfig) {
    super();
    window.gasStore = {};
    window.addEventListener('message', this.buildMessageListener(), false);
    this._serverFunctions = new Proxy({}, { get: proxyHandler }) as ServerFunctions<FM>;
  }

  private buildMessageListener(): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
      const allowOrigin = checkAllowList(event.origin, this._config?.allowedDevelopmentDomains);
      if (!allowOrigin || event.data.type !== 'RESPONSE') return;

      const { response, status, id } = event.data;
      const { resolve, reject } = window.gasStore[id];

      if (status === 'ERROR') {
        reject(response);
      }
      resolve(response);
    };
  }
}

export { ServerProxy };
