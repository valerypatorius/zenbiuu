import { join } from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { config } from './config';
import { theme } from './theme';
import { HubChannel } from '../../hub/src/types';
import { Window } from './window';
import { env } from './env';
import { handleCors } from './cors';
import { handleRendererRequests } from './handlers';

const appRootUrl = env.MODE === 'development'
  ? env.VITE_DEV_SERVER_URL
  : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

/**
 * If false, assume that another instance of the app is already running
 */
const isSingleInstance = app.requestSingleInstanceLock();

/**
 * Do not allow creating multiple app instances
 */
if (!isSingleInstance) {
  app.quit();
}

/**
 * Create main app window
 */
function createWindow (): void {
  const { width, height } = config.get('windowBounds');

  Window.Main = new BrowserWindow({
    show: false,
    width,
    height,
    backgroundColor: theme.windowColor,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../../hub/dist/index.cjs'),
    },
  });

  /**
   * When window is ready, show it
   */
  Window.Main.on('ready-to-show', () => {
    Window.Main?.show();

    if (env.MODE === 'development') {
      Window.Main?.webContents.openDevTools();
    }
  });

  /**
   * Update window size in config file
   */
  Window.Main.on('resized', () => {
    if (Window.Main === null) {
      return;
    }

    const { width, height } = Window.Main.getBounds();

    config.set('windowBounds', {
      width,
      height,
    });
  });

  /**
   * Clear references to main window, when it is closed
   */
  Window.Main.on('closed', () => {
    Window.Main = null;
  });

  /**
   * Open all links in default browser
   */
  Window.Main.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    void shell.openExternal(url);
  });

  /**
   * When window maximized state is changed, update state in renderer process
   */
  Window.Main.on('maximize', () => {
    Window.Main?.webContents.send(HubChannel.WindowStateChange, {
      isAppWindowMaximized: Window.Main.isMaximized(),
    });
  });

  Window.Main.on('unmaximize', () => {
    Window.Main?.webContents.send(HubChannel.WindowStateChange, {
      isAppWindowMaximized: Window.Main.isMaximized(),
    });
  });

  void Window.Main.loadURL(appRootUrl);
}

/**
 * Disable system media keys handling
 */
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

/**
 * Allow only one running instance of the app
 */
app.on('second-instance', () => {
  if (Window.Main === null) {
    return;
  }

  if (Window.Main.isMinimized()) {
    Window.Main.restore();
  }

  Window.Main.focus();
});

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
  if (Window.Main === null) {
    createWindow();
  }
});

/**
 * Start the app
 */
app.whenReady()
  .then(() => {
    const themeSource = config.get('theme');

    theme.setSource(themeSource);

    handleCors();
    handleRendererRequests();
    createWindow();
  }).catch((error) => {
    console.error('Failed to start the app', error);
  });
