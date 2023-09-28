import { autoUpdater, type UpdateInfo } from 'electron-updater';

export default class Updater {
  constructor () {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.forceDevUpdateConfig = import.meta.env.MODE === 'development';
  }

  async check (): Promise<UpdateInfo | undefined> {
    const result = await autoUpdater.checkForUpdates();

    if (result === null) {
      return undefined;
    }

    const isUpdateAvailable = autoUpdater.currentVersion.compare(result.updateInfo.version) === -1;

    return isUpdateAvailable ? result.updateInfo : undefined;
  }

  async download (): Promise<string[]> {
    return await autoUpdater.downloadUpdate();
  }

  install (): void {
    autoUpdater.quitAndInstall();
  }
}
