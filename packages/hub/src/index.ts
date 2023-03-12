import { contextBridge, ipcRenderer, type NativeTheme } from 'electron';
import { HubChannel, HubApiKey, HubStateChangeEvent, type HubState, type MainProcessApi, type HubAppInfo } from './types';

const { platform } = process;

const app: HubAppInfo = {
  name: '',
  version: '',
  locale: 'en',
};

/**
 * State with simple data, updated by main process
 */
const state: HubState = {
  isAppWindowMaximized: false,
  themeSource: 'system',
  shouldUseDarkColors: true,
};

/**
 * Set app theme
 */
async function setThemeSource (value: NativeTheme['themeSource']): Promise<void> {
  const themeState: Partial<HubState> = await ipcRenderer.invoke(HubChannel.SetThemeSource, value);

  Object.entries(themeState).forEach(([key, value]) => {
    state[key as keyof Partial<HubState>] = value;
  });
}

/**
 * Call app window method
 */
async function callWindowMethod (methodName: string, ...args: any[]): Promise<boolean> {
  return await ipcRenderer.invoke(HubChannel.CallWindowMethod, methodName, ...args);
}

/**
 * Load url in separate window, wait for redirect and return redirected url
 */
async function waitForRedirect (url: string): Promise<string> {
  return await ipcRenderer.invoke(HubChannel.WaitForRedirect, url);
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
  app,
  platform,
  setThemeSource,
  callWindowMethod,
  waitForRedirect,
  clearSessionStorage,
  getState: () => state,
};

/**
 * Make api available in renderer process
 */
contextBridge.exposeInMainWorld(HubApiKey, api);

/**
 * Request initial data from main process
 */
void ipcRenderer.invoke(HubChannel.Initial).then((initialState: HubState) => {
  Object.entries(initialState).forEach(([key, value]) => {
    state[key] = value;
  });

  dispatchStateChangeEvent();
});

/**
 * Request app info from main process
 */
void ipcRenderer.invoke(HubChannel.AppInfo).then((appInfo: HubAppInfo) => {
  Object.entries(appInfo).forEach(([key, value]) => {
    app[key] = value;
  });

  dispatchStateChangeEvent();
});

/**
 * Listen for future state changes from main process
 */
ipcRenderer.on(HubChannel.WindowStateChange, (event, receivedState: HubState) => {
  Object.entries(receivedState).forEach(([key, value]) => {
    state[key] = value;
  });

  dispatchStateChangeEvent();
});
