/**
 * Available app update statuses
 */
export enum AppUpdateStatus {
  NotChecked = 'notChecked',
  Checking = 'checking',
  Error = 'error',
  Available = 'available',
  NotAvailable = 'notAvailable',
  Downloading = 'downloading',
  ReadyForInstall = 'readyForInstall',
}
