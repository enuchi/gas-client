import { checkAllowList } from '../utils/check-allow-list';
import { proxyHandlerServerFunction } from '../utils/proxy-handler';
import { FunctionProvider } from './function-provider';
import { AppWindow, MessageType, ResponseStatus } from '../types/dev-server';
import { FunctionMap, ServerFunctions } from '../types/functions';
import { ServerConfig } from '../types/config';

declare const window: AppWindow;

class ServerProxy<FM extends FunctionMap> extends FunctionProvider<FM> {
  constructor(private _config?: ServerConfig) {
    super();
    window.gasStore = {};
    window.addEventListener('message', this.buildMessageListener(), false);
    this._serverFunctions = new Proxy({}, { get: proxyHandlerServerFunction }) as ServerFunctions<FM>;
  }

  private buildMessageListener(): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
      const allowOrigin = checkAllowList(event.origin, this._config?.allowedDevelopmentDomains);
      if (!allowOrigin || event.data.type !== MessageType.RESPONSE) return;

      const { response, status, id } = event.data;
      const { resolve, reject } = window.gasStore[id];

      if (status === ResponseStatus.ERROR) {
        reject(response);
      }
      resolve(response);
    };
  }
}

export { ServerProxy };
