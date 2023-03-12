import { BrowserWindow } from 'electron';
import { theme } from './theme';
import { getAccessTokenFromTwitchAuthUrl } from './utils';
import { env } from './env';

/**
 * Keep global references of windows objects
 * to avoid closing by the garbage collector
 */
export const Window: Record<string, BrowserWindow | null> = {
  Main: null,
  Auth: null,
};

/**
 * Open auth window to receive access token
 */
export async function getAuthToken (url: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    Window.Auth = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      backgroundColor: theme.windowColor,
    });

    Window.Auth.webContents.on('will-navigate', (redirectEvent, redirectUrl) => {
      /**
       * Do not throw an error here, because multiple redirects happen
       */
      if (redirectUrl.indexOf(env.VITE_APP_REDIRECT_URL) !== 0) {
        return;
      }

      const token = getAccessTokenFromTwitchAuthUrl(redirectUrl);

      if (token !== null) {
        resolve(token);
      } else {
        reject(new Error('Token is missing'));
      }

      Window.Auth?.destroy();
    });

    Window.Auth.once('ready-to-show', () => {
      Window.Auth?.show();
    });

    Window.Auth.webContents.on('did-fail-load', () => {
      reject(new Error('Window failed to load'));
    });

    Window.Auth.on('close', () => {
      reject(new Error('Window closed by user'));
    });

    Window.Auth.on('closed', () => {
      Window.Auth = null;
    });

    void Window.Auth.loadURL(url);
  });
}
