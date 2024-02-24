import { join } from 'path';
import { shell, BrowserWindow } from 'electron';
import { type createStore } from './store';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createWindow(store: ReturnType<typeof createStore>) {
  const url =
    import.meta.env.MODE === 'development'
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  let instance: BrowserWindow | undefined;

  function open(options: Electron.BrowserWindowConstructorOptions = {}): void {
    const { width, height } = store.get('windowBounds');

    instance = new BrowserWindow({
      icon: join(__dirname, '../../../build/512x512.png'),
      width,
      height,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: 'rgba(0, 0, 0, 0)',
        symbolColor: 'rgba(255, 255, 255, 0.4)',
        height: 40,
      },
      webPreferences: {
        preload: join(__dirname, '../../preload/dist/index.cjs'),
      },
      ...options,
    });

    /**
     * When window is ready, show it
     */
    instance.on('ready-to-show', show);

    /**
     * Clear references to main window, when it is closed
     */
    instance.on('closed', destroy);

    /**
     * Update window size in config file
     */
    instance.on('resized', handleResize);

    instance.webContents.on('will-navigate', interceptUrlLoad);

    void instance.loadURL(url);
  }

  function show(): void {
    // instance?.show();

    if (import.meta.env.MODE === 'development') {
      instance?.webContents.openDevTools();
    }
  }

  function restore(): void {
    instance?.restore();
  }

  function focus(): void {
    instance?.focus();
  }

  /**
   * @todo Emit event to clear external references
   */
  function destroy(): void {
    instance = undefined;
  }

  function handleResize(): void {
    if (instance === undefined) {
      return;
    }

    const { width, height } = instance.getBounds();

    store.set('windowBounds', {
      width,
      height,
    });
  }

  function send(channel: string, ...args: any[]): void {
    instance?.webContents.send(channel, ...args);
  }

  function setColor(value: string): void {
    instance?.setBackgroundColor(value);
  }

  function interceptUrlLoad(event: Electron.Event<Electron.WebContentsWillNavigateEventParams>, url: string): void {
    event.preventDefault();

    void shell.openExternal(url);
  }

  return {
    open,
    send,
    setColor,
    focus,
    restore,
    get isMinimized(): boolean {
      return instance?.isMinimized() ?? false;
    },
  };
}
