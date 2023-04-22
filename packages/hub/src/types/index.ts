import type { NativeTheme } from 'electron';
import type { UpdateInfo } from 'electron-updater';

export const HubApiKey = 'hub';

/**
 * Available channels for communication
 * between main and renderer processes
 */
export enum HubChannel {
  Initial = 'initial',
  WindowStateChange = 'windowStateChange',
  SetThemeSource = 'setThemeSource',
  CallWindowMethod = 'callWindowMethod',
  ClearSessionStorage = 'clearSessionStorage',
  CheckForUpdates = 'checkForUpdates',
  DownloadUpdate = 'downloadUpdate',
  InstallUpdate = 'installUpdate',
  InterceptedLink = 'interceptedLink',
  OpenUrlInBrowser = 'openUrlInBrowser',
};

/**
 * Hub data state
 */
export interface HubState {
  [key: string]: any;
  app: {
    name: string;
    version: string;
    locale: string;
  };
  clientId: string;
  streamClientId: string;
  redirectUrl: string;
  platform: NodeJS.Platform;
  isAppWindowMaximized: boolean;
}

export interface UpdaterApi {
  check: () => Promise<UpdateInfo | undefined>;
  download: () => Promise<string[]>;
  install: () => void;
}

/**
 * Hub data and methods, available in renderer process via window.hub
 */
export interface MainProcessApi {
  setThemeSource: (value: NativeTheme['themeSource']) => Promise<void>;
  callWindowMethod: (methodName: string, ...args: any[]) => Promise<boolean>;
  clearSessionStorage: () => void;
  getState: () => HubState;
  openUrlInBrowser: (url: string) => void;
  updater: UpdaterApi;
}

/**
 * Custom event name.
 * Dispatched when hub state is changed by main process.
 * Updates reactive state copy
 */
export const HubStateChangeEvent = 'hubStateChange';

/**
 * Dispatched when app intercepts links with app protocol from the outside.
 * E.g. when "zenbiuu://open" is opened in browser
 */
export const HubInterceptedLinkEvent = 'hubInterceptedLink';

declare global {
  interface Window {
    hub: MainProcessApi;
  }
}
