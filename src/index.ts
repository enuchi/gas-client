import checkAllowList from './utils/check-allow-list';
import ignoredFunctionNames from './utils/ignored-function-names';
import shouldSetupProxy from './utils/should-setup-proxy';
import proxyHandler from './utils/proxy-handler';
import promisify from './utils/promisify';
import { ServerConfig } from './types/config';
import { ServerFunctions, ServerFunctionsMap } from './types/functions';

export default class Server<F extends ServerFunctionsMap = {}> {
  private _serverFunctions: ServerFunctions<F> = {} as ServerFunctions<F>;

  /**
   * Accepts a single `config` object
   * @param {object} [_config] An optional config object for use in development.
   * @param {string|function} [config.allowedDevelopmentDomains] An optional config to specify which domains are permitted for communication with Google Apps Script Webpack Dev Server development tool. This is a security setting, and if not specified, this will block functionality in development. Will accept either a space-separated string of allowed subdomains, e.g. `https://localhost:3000 http://localhost:3000` (notice no trailing slash); or a function that takes in the requesting origin should return `true` to allow communication, e.g. `(origin) => /localhost:\d+$/.test(origin)`
   */
  constructor(private _config?: ServerConfig) {
    try {
      // get the names of all of our publicly accessible server functions
      this._serverFunctions = Object.keys(google.script.run).reduce(
        (acc, functionName) =>
          // filter out the reserved names -- we don't want those
          ignoredFunctionNames.includes(functionName)
            ? acc
            : {
                // attach Promise-based functions to the serverFunctions property
                ...acc,
                [functionName]: promisify(functionName),
              },
        {} as ServerFunctions<F>
      );
    } catch (err) {
      if (shouldSetupProxy(err)) {
        // we'll store and access the resolve/reject functions here by id
        window.gasStore = {};

        // set up the message 'receive' handler
        const receiveMessageHandler = (event: MessageEvent) => {
          const allowedDevelopmentDomains = this._config
            ?.allowedDevelopmentDomains;

          // check the allow list for the receiving origin
          const allowOrigin = checkAllowList(
            event.origin,
            allowedDevelopmentDomains
          );
          if (!allowOrigin) return;

          // we only care about the type: 'RESPONSE' messages here
          if (event.data.type !== 'RESPONSE') return;

          const { response, status, id } = event.data;

          // look up the saved resolve and reject funtions in our global store based
          // on the response id, and call the function depending on the response status
          const { resolve, reject } = window.gasStore[id];

          if (status === 'ERROR') {
            reject(response);
          }
          resolve(response);
        };

        window.addEventListener('message', receiveMessageHandler, false);

        this._serverFunctions = new Proxy(
          {},
          { get: proxyHandler }
        ) as ServerFunctions<F>;
      }
    }
  }

  get serverFunctions(): ServerFunctions<F> {
    return this._serverFunctions;
  }
}
