import { google } from "./google";

type FunctionMap = Record<string, (...args: any[]) => any>;

type Promisified<F extends (...args: any[]) => any> = (...params: Parameters<F>) => Promise<ReturnType<F>>;

type RecognizedServerFunctions<R extends FunctionMap> = {
  [Name in keyof R]: Promisified<R[Name]>;
};

type UnrecognizedServerFunctions = {
  [key: string]: (...args: any[]) => Promise<any>;
};

type ServerFunctions<FM extends FunctionMap> = RecognizedServerFunctions<FM> & UnrecognizedServerFunctions;

type HostFunctions = {
  close: typeof google.script.host.close;
  setHeight: typeof google.script.host.setHeight;
  setWidth: typeof google.script.host.setWidth;
  focusEditor: typeof google.script.host.editor.focus;
};

export { FunctionMap, ServerFunctions, HostFunctions };
