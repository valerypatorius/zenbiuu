import { contextBridge, ipcRenderer, type NativeTheme } from 'electron';
import { type UpdateInfo } from 'electron-updater';
import { HubChannel, HubApiKey, HubStateChangeEvent, type HubState, type MainProcessApi, type UpdaterApi, HubInterceptedLinkEvent } from './types';

/**
 * State with simple data, updated by main process
 */
const state: HubState = {
  app: {
    name: '',
    version: '',
    locale: 'en',
  },
  clientId: '',
  streamClientId: '',
  redirectUrl: '',
  platform: process.platform,
  isAppWindowMaximized: false,
};

/**
 * Set app theme
 */
async function setThemeSource (value: NativeTheme['themeSource']): Promise<void> {
  return await ipcRenderer.invoke(HubChannel.SetThemeSource, value);
}

/**
 * Call app window method
 */
async function callWindowMethod (methodName: string, ...args: any[]): Promise<boolean> {
  return await ipcRenderer.invoke(HubChannel.CallWindowMethod, methodName, ...args);
}

/**
 * Dispatch custom event on window,
 * when state is changed
 */
function dispatchStateChangeEvent (): void {
  const event = new CustomEvent(HubStateChangeEvent, {
    detail: {
      state,
    },
  });

  window.dispatchEvent(event);
}

/**
 * Dispatch custom event on window,
 * when app link is intercepted
 */
function dispatchInterceptedLink (link: string): void {
  const event = new CustomEvent(HubInterceptedLinkEvent, {
    detail: {
      link,
    },
  });

  window.dispatchEvent(event);
}

/**
 * CLear session storage data
 */
function clearSessionStorage (): void {
  ipcRenderer.send(HubChannel.ClearSessionStorage);
}

/**
 * Open URL in default browser
 */
function openUrlInBrowser (url: string): void {
  ipcRenderer.send(HubChannel.OpenUrlInBrowser, url);
}

/**
 * Methods for communication with app updater
 */
const updater: UpdaterApi = {
  check: async (): Promise<UpdateInfo | undefined> => {
    return await ipcRenderer.invoke(HubChannel.CheckForUpdates);
  },
  download: async (): Promise<string[]> => {
    return await ipcRenderer.invoke(HubChannel.DownloadUpdate);
  },
  install: () => {
    void ipcRenderer.invoke(HubChannel.InstallUpdate);
  },
};

/**
 * Object with all available data and methods,
 * available in renderer process under window.hub
 */
const api: MainProcessApi = {
  setThemeSource,
  callWindowMethod,
  clearSessionStorage,
  openUrlInBrowser,
  getState: () => state,
  updater,
};

/**
 * Make api available in renderer process
 */
contextBridge.exposeInMainWorld(HubApiKey, api);

function updateState (updatedState: HubState): void {
  Object.entries(updatedState).forEach(([key, value]) => {
    state[key] = value;
  });

  dispatchStateChangeEvent();
}

/**
 * Request initial data from main process
 */
void ipcRenderer.invoke(HubChannel.Initial).then(updateState);

/**
 * Listen for future state changes from main process
 */
ipcRenderer.on(HubChannel.WindowStateChange, (event, receivedState: HubState) => {
  updateState(receivedState);
});

/**
 * Listen for intercepted app links
 */
ipcRenderer.on(HubChannel.InterceptedLink, (event, link: string) => {
  dispatchInterceptedLink(link);
});
