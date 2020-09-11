type GASStore = Record<
  string,
  {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }
>;

interface GasFunctionData {
  id: string;
  type: 'REQUEST' | 'RESPONSE';
}

interface DevServerRequest extends GasFunctionData {
  args: unknown[];
  functionName: string;
  type: 'REQUEST';
}

interface DevServerResponse extends GasFunctionData {
  response: unknown;
  status: 'ERROR' | 'SUCCESS';
  type: 'RESPONSE';
}

interface DevServerContentWindow<Origin extends 'GAS' | 'App'> extends Window {
  postMessage: (
    message: Origin extends 'GAS' ? DevServerResponse : DevServerRequest,
    targetOrigin: string,
    transfer?: Transferable[]
  ) => void;
}

interface AppWindow extends Window {
  parent: DevServerContentWindow<'App'>;
  gasStore: GASStore;
}

interface DevServerRequestEvent extends MessageEvent {
  data: DevServerRequest;
}

interface GASDevServerIFrame extends HTMLIFrameElement {
  contentWindow: DevServerContentWindow<'GAS'>;
}

export { AppWindow, DevServerRequestEvent, GASDevServerIFrame };
