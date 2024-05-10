import path from 'path';
import { app } from 'electron';

export function createApp() {
  const protocol = app.getName();

  const isAllowAppStart = app.requestSingleInstanceLock();

  async function start(): Promise<void> {
    beforeStart();

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
     * Allow only one running instance of the app
     */
    // app.on('second-instance', () => {
    //   if (window.isMinimized()) {
    //     window.restore();
    //   }

    //   window.focus();
    // });

    /**
     * Quit when all windows are closed, but leave the app active on Mac
     */
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    /**
     * Activate window on Mac, if no other windows are opened
     */
    app.on('activate', () => {
      // if (Window.Main === null) {
      //   createAppWindow();
      // }
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
