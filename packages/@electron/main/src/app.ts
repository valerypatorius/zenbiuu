import path from 'path';
import { app } from 'electron';

export function createApp() {
  const protocol = import.meta.env.VITE_APP_PROTOCOL;

  const isAllowAppStart = app.requestSingleInstanceLock();

  async function start(beforeStartExternal?: (instance: Electron.App) => void): Promise<void> {
    beforeStart();
    beforeStartExternal?.(app);

    await app.whenReady();
  }

  function quit(): void {
    app.quit();
  }

  function beforeStart(): void {
    registerProtocol();

    app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

    /**
     * Experimental flags to decrease GPU load aka "it works on my machine"
     */
    app.commandLine.appendSwitch('use-gl', 'angle');
    app.commandLine.appendSwitch('use-angle', 'gl');

    /**
     * @todo Research if window shortcuts can work with this setting
     * @see https://www.electronjs.org/docs/latest/tutorial/performance#8-call-menusetapplicationmenunull-when-you-do-not-need-a-default-menu
     */
    // Menu.setApplicationMenu(null);

    /**
     * Quit when all windows are closed, but leave the app active on Mac
     */
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  function registerProtocol(): void {
    if (!process.defaultApp) {
      app.setAsDefaultProtocolClient(protocol);

      return;
    }

    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(protocol, process.execPath, [path.resolve(process.argv[1])]);
    }
  }

  return {
    start,
    quit,
    isAllowAppStart,
  };
}
