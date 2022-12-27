import { ipcMain } from 'electron';
import ElectronStore from 'electron-store';
import { Schema, StoreFileName, defaultState } from '@/store/schema';
import { HubChannel } from '@/types/hub';

export const store = new ElectronStore({
  name: StoreFileName,
  defaults: defaultState,
});

/**
 * Listen for renderer process requests
 * to get value from or set value in store file
 */
export function listenForConfigRequests (): void {
  ipcMain.handle(HubChannel.ConfigGet, async <T extends keyof Schema>(event: Electron.IpcMainInvokeEvent, key: T) => {
    return store.get(key);
  });

  ipcMain.on(HubChannel.ConfigSet, <T extends keyof Schema>(event: Electron.IpcMainEvent, key: T, value: Schema[T]) => {
    store.set(key, value);
  });
}
