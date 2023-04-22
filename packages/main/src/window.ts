import { join } from 'path';
import { BrowserWindow } from 'electron';
import { theme } from './theme';

/**
 * Keep global references of windows objects
 * to avoid closing by the garbage collector
 */
export const Window: Record<string, BrowserWindow | null> = {
  Main: null,
  Service: null,
};

/**
 * Open new window and load specified url
 */
export function openWindow (url: string, options?: Electron.BrowserWindowConstructorOptions): BrowserWindow {
  const w = new BrowserWindow({
    backgroundColor: theme.windowColor,
    icon: join(__dirname, '../../../build/512x512.png'),
    ...options,
  });

  void w.loadURL(url);

  return w;
}
