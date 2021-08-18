import { ipcMain } from 'electron';
import ElectronStore from 'electron-store';
import { schema, Module as StoreModule, StoreFilename } from '@/types/schema';
import { Channel as HubChannel } from '@/types/hub';

export const config = new ElectronStore({
  name: StoreFilename.Config,
  defaults: schema,
});

export const library = new ElectronStore({
  name: StoreFilename.Library,
  defaults: schema[StoreModule.Library],
});

/**
 * Listen for renderer process requests
 * to get value from or set value in config
 */
export function listenForConfigRequests (): void {
  ipcMain.handle(HubChannel.ConfigGet, async (event, key: string) => {
    return config.get(key);
  });

  ipcMain.on(HubChannel.ConfigSet, (event, key: string, value: any) => {
    config.set(key, value);
  });
}

/**
 * Listen for renderer process requests
 * to get value from or set value in library
 */
export function listenForLibraryRequests (): void {
  ipcMain.handle(HubChannel.LibraryGet, async (event, key: string) => {
    return library.get(key);
  });

  ipcMain.on(HubChannel.LibrarySet, (event, key: string, value: any) => {
    library.set(key, value);
  });
}
