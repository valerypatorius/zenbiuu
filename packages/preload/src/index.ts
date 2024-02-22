import { contextBridge, ipcRenderer, type NativeTheme } from 'electron';
import { type UpdateInfo } from 'electron-updater';
import type AppProperties from '$/entities/AppProperties';
import type MainProcessApiInterface from '$/interfaces/MainProcessApi.interface';
import type UpdaterInterface from '$/interfaces/Updater.interface';
import HubChannel from '$/entities/HubChannel';
import HubEvent from '$/entities/HubEvent';
import HubApiKey from '$/entities/HubApiKey';

/**
 * Set app theme
 */
async function setThemeSource(value: NativeTheme['themeSource']): Promise<void> {
  return await ipcRenderer.invoke(HubChannel.SetThemeSource, value);
}

/**
 * Dispatch custom event on window,
 * when app link is intercepted
 */
function dispatchInterceptedLink(link: string): void {
  const event = new CustomEvent(HubEvent.InterceptedLink, {
    detail: {
      link,
    },
  });

  window.dispatchEvent(event);
}

/**
 * CLear session storage data
 */
function clearSessionStorage(): void {
  ipcRenderer.send(HubChannel.ClearSessionStorage);
}

/**
 * Open URL in default browser
 */
function openUrlInBrowser(url: string): void {
  ipcRenderer.send(HubChannel.OpenUrlInBrowser, url);
}

async function getAppProperties(): Promise<AppProperties> {
  return await ipcRenderer.invoke(HubChannel.GetAppProperties);
}

/**
 * Methods for communication with app updater
 */
const updater: UpdaterInterface = {
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
const api: MainProcessApiInterface = {
  getAppProperties,
  setThemeSource,
  clearSessionStorage,
  openUrlInBrowser,
  updater,
};

/**
 * Make api available in renderer process
 */
contextBridge.exposeInMainWorld(HubApiKey, api);

/**
 * Listen for intercepted app links
 */
ipcRenderer.on(HubChannel.InterceptedLink, (event, link: string) => {
  dispatchInterceptedLink(link);
});
