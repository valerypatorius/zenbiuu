import { app, ipcMain, shell } from 'electron';
// import { type UpdateInfo } from 'electron-updater';
import type Window from '../window';
import type Theme from '../theme';
// import type Updater from '../updater';
import { type HubAppProperties, HubChannel } from '@/types/hub';

export default class Hub {
  constructor (
    private readonly window: Window,
    private readonly theme: Theme,
  ) {
    ipcMain.handle(HubChannel.GetAppProperties, async (): Promise<HubAppProperties> => {
      return {
        name: app.getName(),
        version: app.getVersion(),
        locale: app.getLocale().replace(/-\w+/, ''),
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
    app.on('second-instance', (event, commandLine) => {
      const link = commandLine.pop();

      if (link === undefined) {
        return;
      }

      this.window.send(HubChannel.InterceptedLink, link);
    });

    /**
     * Intercept app links on Mac OS
     */
    // app.on('open-url', (event, link) => {
    //   this.window.send(HubChannel.InterceptedLink, link);
    // });
  }

  public destroy (): void {
    ipcMain.removeAllListeners(HubChannel.GetAppProperties);
    ipcMain.removeAllListeners(HubChannel.OpenUrlInBrowser);

    // app.off('second-instance');
  }
}
