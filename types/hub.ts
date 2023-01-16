import { Schema } from '../store/schema';
import { AppColorScheme } from './color';

export const HubApiKey = 'hub';

/**
 * Available channels for communication
 * between main and renderer processes
 */
export enum HubChannel {
  Initial = 'initial',
  AppInfo = 'appInfo',
  StateChange = 'stateChange',

  ConfigGet = 'configGet',
  ConfigSet = 'configSet',

  LibraryGet = 'libraryGet',
  LibrarySet = 'librarySet',
  LibraryClear = 'libraryClear',

  SetNativeTheme = 'setNativeTheme',
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
  themeSource: string;
  shouldUseDarkColors: boolean;
}

/**
 * Hub data and methods, available in renderer process via window.hub
 */
export interface MainProcessApi {
  store: {
    get: <T extends keyof Schema>(key?: T) => Promise<Schema[T]>;
    set: <T extends keyof Schema>(key: T, value: Schema[T]) => void;
  };
  platform: string;
  app: HubAppInfo;
  setNativeTheme: (value: AppColorScheme) => Promise<void>;
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
