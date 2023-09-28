import type { NativeTheme } from 'electron';
import type { UpdateInfo } from 'electron-updater';

export const HubWindowApiKey = 'hub';

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

export enum HubEvent {
  /**
   * Dispatched when app intercepts links with app protocol from the outside.
   * E.g. when "zenbiuu://open" is opened in browser
   */
  InterceptedLink = 'hubInterceptedLink',
}

export interface UpdaterApi {
  check: () => Promise<UpdateInfo | undefined>;
  download: () => Promise<string[]>;
  install: () => void;
}

export interface HubAppProperties {
  name: string;
  version: string;
  locale: string;
}

/**
 * Hub data and methods, available in renderer process via window.hub
 */
export interface HubMainProcessApi {
  updater: UpdaterApi;
  getAppProperties: () => Promise<HubAppProperties>;
  setThemeSource: (value: NativeTheme['themeSource']) => Promise<void>;
  clearSessionStorage: () => void;
  openUrlInBrowser: (url: string) => void;
}
