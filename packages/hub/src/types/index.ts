import type { NativeTheme } from 'electron';

export const HubApiKey = 'hub';

/**
 * Available channels for communication
 * between main and renderer processes
 */
export enum HubChannel {
  Initial = 'initial',
  AppInfo = 'appInfo',
  WindowStateChange = 'windowStateChange',

  SetThemeSource = 'setThemeSource',
  CallWindowMethod = 'callWindowMethod',

  RequestAccessToken = 'requestAccessToken',
  ClearSessionStorage = 'clearSessionStorage',
}

export interface HubAppInfo {
  [key: string]: any;
  name: string;
  version: string;
  locale: string;
}

/**
 * Hub data state
 */
export interface HubState {
  [key: string]: any;
  isAppWindowMaximized: boolean;
  themeSource: NativeTheme['themeSource'];
  shouldUseDarkColors: boolean;
}

/**
 * Hub data and methods, available in renderer process via window.hub
 */
export interface MainProcessApi {
  platform: NodeJS.Platform;
  app: HubAppInfo;
  setThemeSource: (value: NativeTheme['themeSource']) => Promise<void>;
  callWindowMethod: (methodName: string, ...args: any[]) => Promise<boolean>;
  requestAccessToken: (url: string) => Promise<string>;
  clearSessionStorage: () => void;
  getState: () => HubState;
}

/**
 * Custom event name.
 * Dispatched when hub state is changed by main process.
 * Updates reactive state copy
 */
export const HubStateChangeEvent = 'hubStateChange';

declare global {
  interface Window {
    hub: MainProcessApi;
  }
}
