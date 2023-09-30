/**
 * Available channels for communication between main and renderer processes
 */
enum HubChannel {
  GetAppProperties = 'getAppProperties',
  SetThemeSource = 'setThemeSource',
  ClearSessionStorage = 'clearSessionStorage',
  CheckForUpdates = 'checkForUpdates',
  DownloadUpdate = 'downloadUpdate',
  InstallUpdate = 'installUpdate',
  InterceptedLink = 'interceptedLink',
  OpenUrlInBrowser = 'openUrlInBrowser',
}

export default HubChannel;
