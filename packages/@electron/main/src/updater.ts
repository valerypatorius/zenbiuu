import { type UpdateInfo, autoUpdater } from 'electron-updater';

export function createUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.forceDevUpdateConfig = import.meta.env.MODE === 'development';

  async function check(): Promise<UpdateInfo | undefined> {
    const result = await autoUpdater.checkForUpdates();

    if (result === null) {
      return undefined;
    }

    const isUpdateAvailable =
      autoUpdater.currentVersion.compare(result.updateInfo.version) === -1;

    return isUpdateAvailable ? result.updateInfo : undefined;
  }

  async function download(): Promise<string[]> {
    return await autoUpdater.downloadUpdate();
  }

  function install(): void {
    autoUpdater.quitAndInstall();
  }

  return {
    check,
    download,
    install,
  };
}
