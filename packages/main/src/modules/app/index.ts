import path from 'path';
import { app, Menu } from 'electron';
import type AppInterface from '@/interfaces/App.interface';

export default class App implements AppInterface {
  readonly #protocol = app.getName();

  public isAllowAppStart = app.requestSingleInstanceLock();

  public async start (): Promise<void> {
    this.beforeStart();

    await app.whenReady();
  }

  private beforeStart (): void {
    this.registerProtocol();

    app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

    /**
     * @todo Research GPU related flags
     */
    // app.commandLine.appendSwitch('use-gl', 'desktop');

    /**
     * @see https://www.electronjs.org/docs/latest/tutorial/performance#8-call-menusetapplicationmenunull-when-you-do-not-need-a-default-menu
     */
    Menu.setApplicationMenu(null);

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

  private registerProtocol (): void {
    if (!process.defaultApp) {
      app.setAsDefaultProtocolClient(this.#protocol);

      return;
    }

    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(this.#protocol, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  }

  public quit (): void {
    app.quit();
  }
}
