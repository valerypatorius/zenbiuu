/**
 * Available channels for communication between main and renderer processes
 */
export enum HubChannel {
  GetAppProperties = 'getAppProperties',
  SetThemeSource = 'setThemeSource',
  ClearSessionStorage = 'clearSessionStorage',
  CheckForUpdates = 'checkForUpdates',
  DownloadUpdate = 'downloadUpdate',
  InstallUpdate = 'installUpdate',
  InterceptedLink = 'interceptedLink',
  OpenUrlInBrowser = 'openUrlInBrowser',
}
