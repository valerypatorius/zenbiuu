import type { NativeTheme } from 'electron';

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
  WaitForRedirect = 'waitForRedirect',
  ClearSessionStorage = 'clearSessionStorage',
}

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

/**
 * Hub data and methods, available in renderer process via window.hub
 */
export interface MainProcessApi {
  setThemeSource: (value: NativeTheme['themeSource']) => Promise<void>;
  callWindowMethod: (methodName: string, ...args: any[]) => Promise<boolean>;
  waitForRedirect: (url: string) => Promise<string>;
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
