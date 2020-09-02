type GasStore = Record<
  string,
  {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }
>;

interface Window {
  gasStore: GasStore;
}
