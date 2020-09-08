interface DevServerRequestEvent extends MessageEvent {
  data: DevServerRequest;
}

interface GASDevServerIFrame extends HTMLIFrameElement {
  contentWindow: DevServerContentWindow<'GAS'>;
}

export { DevServerRequestEvent, GASDevServerIFrame };
