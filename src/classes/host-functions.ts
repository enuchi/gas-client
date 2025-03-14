import { ScriptHostProvider } from './script-host-provider';

class ScriptHostFunctions extends ScriptHostProvider {
  constructor() {
    super();
    this.initializeScriptHostFunctions();
  }

  private initializeScriptHostFunctions(): void {
    this._hostFunctions = {
      close: google.script.host.close,
      setHeight: google.script.host.setHeight,
      setWidth: google.script.host.setWidth,
      focusEditor: google.script.host.editor.focus,
    };
  }
}

export { ScriptHostFunctions };
