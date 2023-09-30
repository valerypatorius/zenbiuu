export default interface WindowInterface {
  isMinimized: boolean;
  open: (options: Electron.BrowserWindowConstructorOptions) => void;
  restore: () => void;
  focus: () => void;
  send: (channel: string, ...args: any[]) => void;
  setColor: (color: string) => void;
}
