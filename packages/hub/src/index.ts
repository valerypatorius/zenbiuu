import { contextBridge, ipcRenderer } from 'electron';
import { HubChannel, HubState, MainProcessApi, HubApiKey, HubStateChangeEvent, HubAppInfo } from '@/types/hub';
import { AppColorScheme } from '@/types/color';

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
  themeSource: AppColorScheme.Dark,
  shouldUseDarkColors: true,
};

/**
 * Get and set data in store file
 */
const store: MainProcessApi['store'] = {
  get: async (key) => {
    return await ipcRenderer.invoke(HubChannel.ConfigGet, key);
  },
  set: (key, value) => {
    ipcRenderer.send(HubChannel.ConfigSet, key, value);
  },
};

/**
 * Set app theme
 */
async function setNativeTheme (value: AppColorScheme): Promise<void> {
  const themeState: Partial<HubState> = await ipcRenderer.invoke(HubChannel.SetNativeTheme, value);

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
 * Request access token by opening window with specified url
 */
async function requestAccessToken (url: string): Promise<string> {
  return await ipcRenderer.invoke(HubChannel.RequestAccessToken, url);
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
  store,
  platform,
  setNativeTheme,
  callWindowMethod,
  requestAccessToken,
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
ipcRenderer.on(HubChannel.StateChange, (event, receivedState: HubState) => {
  Object.entries(receivedState).forEach(([key, value]) => {
    state[key] = value;
  });

  dispatchStateChangeEvent();
});
