import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { ipcMain, WebContents } from 'electron';
import { HubChannel } from '@/types/hub';
import { AppUpdateStatus } from '@/types/renderer/update';

/**
 * Helper class to process auto updates
 * and communicate with renderer process
 */
class AutoUpdater {
  autoUpdater: typeof autoUpdater;
  status: AppUpdateStatus;
  context: WebContents | null;

  constructor () {
    this.autoUpdater = autoUpdater;
    this.autoUpdater.autoDownload = false;
    this.autoUpdater.autoInstallOnAppQuit = true;

    this.context = null;
    this.status = AppUpdateStatus.NotChecked;

    this.listen();
  }

  /**
   * Set context to send messages to
   */
  setContext (context: WebContents): void {
    this.context = context;
  }

  /**
   * Listen for auto-updater events and update status accordingly.
   * Also listen for renderer messages and perform actions accordingly
   */
  listen (): void {
    this.autoUpdater.on('error', (error: Error) => {
      this.updateStatus(AppUpdateStatus.Error);
      this.throwError(error);
    });

    this.autoUpdater.on('checking-for-update', () => {
      this.updateStatus(AppUpdateStatus.Checking);
    });

    this.autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.updateStatus(AppUpdateStatus.Available, info);
    });

    this.autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.updateStatus(AppUpdateStatus.NotAvailable, info);
    });

    this.autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.updateStatus(AppUpdateStatus.Downloading, null, progress);
    });

    this.autoUpdater.on('update-downloaded', () => {
      this.updateStatus(AppUpdateStatus.ReadyForInstall);
    });

    ipcMain.on(HubChannel.CheckAppUpdates, () => {
      this.check();
    });

    ipcMain.on(HubChannel.DownloadAppUpdate, () => {
      this.download();
    });

    ipcMain.on(HubChannel.InstallAppUpdate, () => {
      this.install();
    });
  }

  /**
   * Check for app updates
   */
  check (): void {
    this.updateStatus(AppUpdateStatus.Checking);
    void this.autoUpdater.checkForUpdates();
  }

  /**
   * Download an update.
   * Set "downloading" status immediately, because download starts with delay
   */
  download (): void {
    this.updateStatus(AppUpdateStatus.Downloading);
    void this.autoUpdater.downloadUpdate();
  }

  /**
   * Quit the app and install an update
   */
  install (): void {
    this.autoUpdater.quitAndInstall();
  }

  /**
   * Update current status and send it to renderer process
   */
  updateStatus (value: AppUpdateStatus, updateData?: UpdateInfo | null, progressData?: ProgressInfo): void {
    this.status = value;
    this.context?.send(HubChannel.SetUpdateStatus, this.status, updateData, progressData);
  }

  /**
   * Send error to renderer process
   */
  throwError (error: Error): void {
    this.context?.send(HubChannel.SetUpdateError, error);
  }
}

const updater = new AutoUpdater();

export default updater;
