import { Schema } from '../store/schema';
import type { UpdateInfo, ProgressInfo } from 'electron-updater';
import { AppColorScheme } from './color';

/**
 * Available channels for communication
 * between main and renderer processes
 */
export enum Channel {
  Initial = 'initial',
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

  SetUpdateStatus = 'setUpdateStatus',
  SetUpdateError = 'setUpdateError',
  CheckAppUpdates = 'checkAppUpdates',
  DownloadAppUpdate = 'downloadAppUpdate',
  InstallAppUpdate = 'installAppUpdate',
}

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

/**
 * Hub data state
 */
export interface State {
  [key: string]: any;
  appLocale: string;
  appVersion: string;
  appName: string;
  isAppWindowMaximized: boolean;
  themeSource: string;
  shouldUseDarkColors: boolean;
  appUpdateStatus: AppUpdateStatus;
  appUpdateData: UpdateInfo | null;
  appUpdateProgress: ProgressInfo | null;
  appUpdateError: Error | null;
}

/**
 * Hub data and methods, available in renderer process via window.hub
 */
export interface MainProcessApi {
  store: {
    get: <T extends keyof Schema>(key?: T) => Promise<Schema[T]>;
    set: <T extends keyof Schema>(key: T, value: Schema[T]) => void;
  };
  env: Record<string, string>;
  platform: string;
  setNativeTheme: (value: AppColorScheme) => Promise<void>;
  callWindowMethod: (methodName: string, ...args: any[]) => Promise<boolean>;
  requestAccessToken: (url: string) => Promise<string>;
  checkAppUpdates: () => void;
  downloadAppUpdate: () => void;
  installAppUpdate: () => void;
  clearSessionStorage: () => void;
  getState: () => State;
  getStringByteLength: (str: string) => number;
}

/**
 * Custom event name.
 * Dispatched when hub state is changed by main process.
 * Updates reactive state copy
 */
export const StateChangeEvent = 'hubStateChange';
