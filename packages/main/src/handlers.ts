import { app, session, ipcMain, type BrowserWindow, type NativeTheme } from 'electron';
import { HubChannel, type HubState, type HubAppInfo } from '../../hub/src/types';
import { theme } from './theme';
import { Window, waitForRedirect } from './window';

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
      isAppWindowMaximized: Window.Main?.isMaximized() ?? false,
      themeSource: theme.get().themeSource,
      shouldUseDarkColors: theme.get().shouldUseDarkColors,
    };
  });

  /**
   * Return app info
   */
  ipcMain.handle(HubChannel.AppInfo, async (): Promise<HubAppInfo> => {
    return {
      locale: app.getLocale(),
      version: app.getVersion(),
      name: app.getName(),
    };
  });

  /**
   * Clear session storage data
   */
  ipcMain.on(HubChannel.ClearSessionStorage, () => {
    void session.defaultSession.clearStorageData();
  });
}
