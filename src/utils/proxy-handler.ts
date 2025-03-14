import { v4 as uuidv4 } from 'uuid';
import { AppWindow, MessageType } from '../types/dev-server';

declare const window: AppWindow;

const proxyHandlerServerFunction = (
  target: unknown,
  functionName: string
): ((...args: unknown[]) => Promise<unknown>) => {
  const id = uuidv4();
  const promise = new Promise((resolve, reject) => {
    window.gasStore[id] = { resolve, reject };
  });
  return (...args: unknown[]) => {
    window.parent.postMessage(
      {
        type: MessageType.REQUEST,
        id,
        functionName,
        args: [...args],
      },
      '*'
    );
    return promise;
  };
};

const proxyHandlerScriptHostFunction = (target: unknown, functionName: string): ((...args: unknown[]) => void) => {
  return (...args: unknown[]) => {
    window.parent.postMessage(
      {
        type: MessageType.SCRIPT_HOST_FUNCTION_REQUEST,
        functionName,
        args: [...args],
      },
      '*'
    );
  };
};

export { proxyHandlerServerFunction, proxyHandlerScriptHostFunction };
