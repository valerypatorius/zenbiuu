import { app, session, ipcMain, type BrowserWindow, type NativeTheme } from 'electron';
import { type UpdateInfo } from 'electron-updater';
import { HubChannel, type HubState } from '../../hub/src/types';
import { theme } from './theme';
import { Window, waitForRedirect } from './window';
import { env } from './env';
import { updater } from './updater';

export function handleRendererRequests (): void {
  /**
   * Set app theme and return its current state
   */
  ipcMain.handle(HubChannel.SetThemeSource, async (event, value: NativeTheme['themeSource']) => {
    theme.setSource(value);
  });

  /**
   * Load url in separate window, wait for redirect and extract url params using provided function
   */
  ipcMain.handle(HubChannel.WaitForRedirect, async (event, url: string) => {
    try {
      return await waitForRedirect(url);
    } catch (error) {
      return await Promise.reject(error);
    }
  });

  /**
   * Call window method, when renderer process requests it
   */
  ipcMain.handle(HubChannel.CallWindowMethod, async (event, methodName: keyof BrowserWindow, ...args: any[]): Promise<boolean> => {
    if (Window.Main !== null && typeof Window.Main[methodName] === 'function') {
      (Window.Main[methodName] as CallableFunction)(...args);

      return true;
    }

    return false;
  });

  /**
   * Return initial app data
   */
  ipcMain.handle(HubChannel.Initial, async (): Promise<HubState> => {
    return {
      app: {
        locale: app.getLocale(),
        version: app.getVersion(),
        name: app.getName(),
      },
      clientId: env.VITE_APP_CLIENT_ID,
      streamClientId: env.VITE_STREAM_CLIENT_ID,
      redirectUrl: env.VITE_APP_REDIRECT_URL,
      platform: process.platform,
      isAppWindowMaximized: Window.Main?.isMaximized() ?? false,
    };
  });

  /**
   * Clear session storage data
   */
  ipcMain.on(HubChannel.ClearSessionStorage, () => {
    void session.defaultSession.clearStorageData();
  });

  /**
   * Check for app updates
   */
  ipcMain.handle(HubChannel.CheckForUpdates, async (): Promise<UpdateInfo | undefined> => {
    return await updater.check();
  });

  /**
   * Download app update
   */
  ipcMain.handle(HubChannel.DownloadUpdate, async (): Promise<string[]> => {
    return await updater.download();
  });

  /**
   * Install app update
   */
  ipcMain.handle(HubChannel.InstallUpdate, (): void => {
    updater.install();
  });
}
