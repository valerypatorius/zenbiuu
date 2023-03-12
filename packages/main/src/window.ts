import { join } from 'path';
import { BrowserWindow } from 'electron';
import { theme } from './theme';
import { env } from './env';

/**
 * Keep global references of windows objects
 * to avoid closing by the garbage collector
 */
export const Window: Record<string, BrowserWindow | null> = {
  Main: null,
  Service: null,
};

/**
 * Open new window and load specified url
 */
export function openWindow (url: string, options?: Electron.BrowserWindowConstructorOptions): BrowserWindow {
  const w = new BrowserWindow({
    backgroundColor: theme.windowColor,
    icon: join(__dirname, '../../../build/512x512.png'),
    ...options,
  });

  void w.loadURL(url);

  return w;
}

/**
 * Open service window, wait for redirect and return redirected url
 */
export async function waitForRedirect (url: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    Window.Service = openWindow(url, {
      width: 800,
      height: 600,
      show: false,
      parent: Window.Main ?? undefined,
    });

    Window.Service.webContents.on('will-navigate', (redirectEvent, redirectUrl) => {
      /**
       * Do not throw an error here, because multiple redirects happen
       */
      if (redirectUrl.indexOf(env.VITE_APP_REDIRECT_URL) !== 0) {
        return;
      }

      resolve(redirectUrl);

      Window.Service?.destroy();
    });

    Window.Service.once('ready-to-show', () => {
      Window.Service?.show();
    });

    Window.Service.webContents.on('did-fail-load', () => {
      reject(new Error('Window failed to load'));
    });

    Window.Service.on('close', () => {
      reject(new Error('Window closed by user'));
    });

    Window.Service.on('closed', () => {
      Window.Service = null;
    });
  });
}
