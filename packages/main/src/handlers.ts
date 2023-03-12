import { HubAppInfo, HubChannel, HubState } from '../../hub/src/types';
import { app, session, ipcMain, BrowserWindow, NativeTheme } from 'electron';
import { theme } from './theme';
import { Window, getAuthToken } from './window';

export function handleRendererRequests (): void {
  /**
 * Set app theme and return its current state
 */
  ipcMain.handle(HubChannel.SetThemeSource, async (event, value: NativeTheme['themeSource']) => {
    theme.setSource(value);
  });

  /**
 * Try to get auth token, when renderer process requests it
 */
  ipcMain.handle(HubChannel.RequestAccessToken, async (event, url: string) => {
    try {
      return await getAuthToken(url);
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
