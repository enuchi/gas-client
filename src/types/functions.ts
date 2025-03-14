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
  /**
   * Closes the current dialog or sidebar.
   */
  close: () => void;
  /**
   * Sets the height of the current dialog. Doesn't work in sidebars.
   * @param height the new height, in pixels
   */
  setHeight: (height: number) => void;
  /**
   * Sets the width of the current dialog. Doesn't work in sidebars.
   * @param width the new width, in pixels
   */
  setWidth: (width: number) => void;
  /**
   * Switches browser focus from the dialog or sidebar to the Google Docs, Sheets, or Forms editor.
   */
  focusEditor: () => void;
};

export { FunctionMap, ServerFunctions, HostFunctions };
