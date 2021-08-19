import { contextBridge, ipcRenderer } from 'electron';
import { Channel as HubChannel, State as HubState, MainProcessApi, StateChangeEvent, AppUpdateStatus } from '@/types/hub';
import { AppColorScheme } from '@/types/color';
import type { UpdateInfo, ProgressInfo } from 'electron-updater';

const { platform } = process;

/**
 * Get and set data in electron-store config files
 */
const fs = {
  config: {
    get: (key?: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        ipcRenderer.invoke(HubChannel.ConfigGet, key).then((value) => {
          resolve(value);
        });
      });
    },
    set: (key: string, value: any): void => {
      ipcRenderer.send(HubChannel.ConfigSet, key, value);
    },
  },
  library: {
    get: (key?: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        ipcRenderer.invoke(HubChannel.LibraryGet, key).then((value) => {
          resolve(value);
        });
      });
    },
    set: (key: string, value: any): void => {
      ipcRenderer.send(HubChannel.LibrarySet, key, value);
    },
    clear: (): void => {
      ipcRenderer.send(HubChannel.LibraryClear);
    },
  },
};

/**
 * Values from .env file
 */
const env = {
  APP_CLIENT_ID: import.meta.env.VITE_APP_CLIENT_ID,
  STREAM_CLIENT_ID: import.meta.env.VITE_STREAM_CLIENT_ID,
  REDIRECT_URL: import.meta.env.VITE_APP_REDIRECT_URL,
};

/**
 * State with simple data, updated by main process
 */
const state: HubState = {
  appLocale: 'en',
  appVersion: '',
  appName: '',
  isAppWindowMaximized: false,
  themeSource: AppColorScheme.Dark,
  shouldUseDarkColors: true,
  appUpdateStatus: AppUpdateStatus.NotChecked,
  appUpdateData: null,
  appUpdateProgress: null,
  appUpdateError: null,
};

/**
 * Set app theme
 */
function setNativeTheme (value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke(HubChannel.SetNativeTheme, value).then((themeState) => {
      Object.entries(themeState).forEach(([key, value]) => {
        state[key] = value;
      });

      resolve();
    });
  });
}

/**
 * Call app window method
 */
function callWindowMethod (methodName: string, ...args: any[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke(HubChannel.CallWindowMethod, methodName, ...args).then((isSuccess: boolean) => {
      resolve(isSuccess);
    });
  });
}

/**
 * Request access token by opening window with specified url
 */
function requestAccessToken (url: string): Promise<string> {
  return ipcRenderer.invoke(HubChannel.RequestAccessToken, url);
}

/**
 * Dispatch custom event on window,
 * when state is changed
 */
function dispatchStateChangeEvent (): void {
  const event = new CustomEvent(StateChangeEvent, {
    detail: {
      state,
    },
  });

  window.dispatchEvent(event);
}

/**
 * Check for app updates
 */
function checkAppUpdates (): void {
  ipcRenderer.send(HubChannel.CheckAppUpdates);
}

/**
 * Download an update
 */
function downloadAppUpdate (): void {
  ipcRenderer.send(HubChannel.DownloadAppUpdate);
}

/**
 * Quit and install an update
 */
function installAppUpdate (): void {
  ipcRenderer.send(HubChannel.InstallAppUpdate);
}

/**
 * CLear session storage data
 */
function clearSessionStorage (): void {
  ipcRenderer.send(HubChannel.ClearSessionStorage);
}

/**
 * Object with all available data and methods,
 * available in renderer process under window.hub
 */
const api: MainProcessApi = {
  fs,
  env,
  platform,
  setNativeTheme,
  callWindowMethod,
  requestAccessToken,
  checkAppUpdates,
  downloadAppUpdate,
  installAppUpdate,
  clearSessionStorage,
  getState: () => state,
  getStringByteLength: (str: string) => Buffer.byteLength(str, 'utf8'),
};

/**
 * Make api available in renderer process
 */
contextBridge.exposeInMainWorld('hub', api);

/**
 * Request initial data from main process
 */
ipcRenderer.invoke(HubChannel.Initial).then((initialState: HubState) => {
  Object.entries(initialState).forEach(([key, value]) => {
    state[key] = value;
  });

  dispatchStateChangeEvent();
});

/**
 * Listen for future state changes from main process
 */
ipcRenderer.on(HubChannel.StateChange, (event, receivedState: HubState) => {
  Object.entries(receivedState).forEach(([key, value]) => {
    state[key] = value;
  });

  dispatchStateChangeEvent();
});

/**
 * Listen for app update status changes
 */
ipcRenderer.on(HubChannel.SetUpdateStatus, (event, status: AppUpdateStatus, updateData?: UpdateInfo, progressData?: ProgressInfo) => {
  state.appUpdateStatus = status;

  if (updateData) {
    state.appUpdateData = updateData;
  }

  if (progressData) {
    state.appUpdateProgress = progressData;
  }

  dispatchStateChangeEvent();
});

/**
 * Listen for update errors
 */
ipcRenderer.on(HubChannel.SetUpdateError, (event, error: Error) => {
  state.appUpdateError = error;

  dispatchStateChangeEvent();
});
