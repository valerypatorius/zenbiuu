import { type AppProperties, HubChannel } from '@zenbiuu/shared';
import { app, ipcMain, shell } from 'electron';
import type { createTheme } from './theme';
import type { createWindow } from './window';
import os from 'node:os';

export function createHub(window: ReturnType<typeof createWindow>, theme?: ReturnType<typeof createTheme>) {
  ipcMain.handle(HubChannel.GetAppProperties, (): AppProperties => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      /**
       * @todo Do not perform replacement
       */
      locale: app.getLocale().replace(/-\w+/, ''),
      isWindows: os.platform() === 'win32',
      isMac: os.platform() === 'darwin',
    };
  });

  // /**
  //  * Set app theme and return its current state
  //  */
  // ipcMain.handle(HubChannel.SetThemeSource, async (event, value: NativeTheme['themeSource']) => {
  //   this.theme.setSource(value);
  // });

  // /**
  //  * Clear session storage data
  //  */
  // ipcMain.on(HubChannel.ClearSessionStorage, () => {
  //   void session.defaultSession.clearStorageData();
  // });

  /**
   * Open url in default browser
   */
  ipcMain.on(HubChannel.OpenUrlInBrowser, (event, url: string) => {
    void shell.openExternal(url);
  });

  // /**
  //  * Check for app updates
  //  */
  // ipcMain.handle(HubChannel.CheckForUpdates, async (): Promise<UpdateInfo | undefined> => {
  //   return await this.updater.check();
  // });

  // /**
  //  * Download app update
  //  */
  // ipcMain.handle(HubChannel.DownloadUpdate, async (): Promise<string[]> => {
  //   return await this.updater.download();
  // });

  // /**
  //  * Install app update
  //  */
  // ipcMain.handle(HubChannel.InstallUpdate, (): void => {
  //   this.updater.install();
  // });

  /**
   * Intercept app links on Windows
   */
  // app.on('second-instance', (event, commandLine) => {
  //   const link = commandLine.pop();

  //   if (link === undefined) {
  //     return;
  //   }

  //   window.send(HubChannel.InterceptedLink, link);
  // });

  /**
   * Intercept app links on Mac OS
   */
  // app.on('open-url', (event, link) => {
  //   this.window.send(HubChannel.InterceptedLink, link);
  // });

  function destroy(): void {
    ipcMain.removeAllListeners(HubChannel.GetAppProperties);
    ipcMain.removeAllListeners(HubChannel.OpenUrlInBrowser);

    // app.off('second-instance');
  }

  return {
    destroy,
  };
}
