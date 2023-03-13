import { autoUpdater, type UpdateInfo } from 'electron-updater';
import { env } from './env';

class UpdatesManager {
  constructor () {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.forceDevUpdateConfig = env.MODE === 'development';
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

export const updater = new UpdatesManager();
