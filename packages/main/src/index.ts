import { join } from 'path';
import { app, BrowserWindow, shell, session, nativeTheme, ipcMain } from 'electron';
import { config, listenForConfigRequests, listenForLibraryRequests } from './fsStore';
import { objectKeysToLowercase, getAccessTokenFromTwitchAuthUrl } from '@/src/utils';
import { Channel as HubChannel, State as HubState } from '@/types/hub';
import { AppColorScheme } from '@/types/color';
import autoUpdater from '@/src/updater';

const env: ImportMetaEnv = import.meta.env;

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
 * Keep a global reference of the window object
 * to avoid closing by js garbage collector
 */
let mainWindow: BrowserWindow | null = null;

/**
 * Returns hex color string for main window
 */
function getWindowColor (): string {
  return nativeTheme.shouldUseDarkColors ? '#17181b' : '#f2f1ef';
}

/**
 * Set app theme and return its current state
 */
function setNativeTheme (value: AppColorScheme): {
  themeSource: string;
  shouldUseDarkColors: boolean;
} {
  nativeTheme.themeSource = value;

  const { themeSource, shouldUseDarkColors } = nativeTheme;

  /**
   * Not working at the moment.
   * Waiting for fix on electron side
   * @link https://github.com/electron/electron/issues/26842
   */
  mainWindow?.setBackgroundColor(getWindowColor());

  return {
    themeSource,
    shouldUseDarkColors,
  };
}

/**
 * Open auth window to receive access token
 */
function getAuthToken (url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let authWindow: BrowserWindow | null = null;

    authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      backgroundColor: getWindowColor(),
    });

    authWindow.webContents.on('will-navigate', (redirectEvent, redirectUrl) => {
      /**
       * Do not throw an error here, because multiple redirects happen
       */
      if (redirectUrl.indexOf(env.VITE_APP_REDIRECT_URL) !== 0) {
        return;
      }

      const token = getAccessTokenFromTwitchAuthUrl(redirectUrl);

      if (token) {
        resolve(token);
      } else {
        reject(new Error('Token is missing'));
      }

      authWindow?.destroy();
    });

    authWindow.once('ready-to-show', () => {
      authWindow?.show();
    });

    authWindow.webContents.on('did-fail-load', () => {
      reject(new Error('Window failed to load'));
    });

    authWindow.on('close', () => {
      reject(new Error('Window closed by user'));
    });

    authWindow.on('closed', () => {
      authWindow = null;
    });

    authWindow.loadURL(url);
  });
}

/**
 * Listen for messages from renderer process and perform actions accordingly
 */
function handleRendererMessages (): void {
  listenForConfigRequests();
  listenForLibraryRequests();

  /**
   * Set app theme and return its current state
   */
  ipcMain.handle(HubChannel.SetNativeTheme, async (event, value: AppColorScheme) => {
    return setNativeTheme(value);
  });

  /**
   * Try to get auth token, when renderer process requests it
   */
  ipcMain.handle(HubChannel.RequestAccessToken, async (event, url: string) => {
    try {
      return await getAuthToken(url);
    } catch (error) {
      return await Promise.reject(error);
    }
  });

  /**
   * Call window method, when renderer process requests it
   */
  ipcMain.handle(HubChannel.CallWindowMethod, async (event, methodName: keyof BrowserWindow, ...args: any[]): Promise<boolean> => {
    if (mainWindow && typeof mainWindow[methodName] === 'function') {
      (mainWindow[methodName] as CallableFunction)(...args);

      return true;
    }

    return false;
  });

  /**
   * Return initial app data
   */
  ipcMain.handle(HubChannel.Initial, async (): Promise<HubState> => {
    const { themeSource, shouldUseDarkColors } = nativeTheme;

    return {
      appLocale: app.getLocale(),
      appVersion: app.getVersion(),
      appName: app.getName(),
      isAppWindowMaximized: mainWindow ? mainWindow.isMaximized() : false,
      themeSource,
      shouldUseDarkColors,
      appUpdateStatus: autoUpdater.status,
      appUpdateData: null,
      appUpdateProgress: null,
      appUpdateError: null,
    };
  });

  /**
   * Clear session storage data
   */
  ipcMain.on(HubChannel.ClearSessionStorage, () => {
    session.defaultSession.clearStorageData();
  });
}

/**
 * Create main app window
 */
function createWindow (): void {
  mainWindow = new BrowserWindow({
    show: false,
    width: config.get('windowBounds.width'),
    height: config.get('windowBounds.height'),
    backgroundColor: getWindowColor(),
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../../hub/dist/index.cjs'),
    },
  });

  /**
   * Set context for auto updater to send messages to
   */
  autoUpdater.setContext(mainWindow.webContents);

  /**
   * When window is ready, show it
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();

    if (env.MODE === 'development') {
      mainWindow?.webContents.openDevTools();
    }
  });

  /**
   * Update window size in config file
   */
  mainWindow.on('resized', () => {
    if (mainWindow === null) {
      return;
    }

    const { width, height } = mainWindow.getBounds();

    config.set('windowBounds', { width, height });
  });

  /**
   * Clear references to main window, when it is closed
   */
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /**
   * Open all links in default browser
   */
  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  /**
   * When window maximized state is changed, update state in renderer process
   */
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send(HubChannel.StateChange, {
      isAppWindowMaximized: mainWindow.isMaximized(),
    });
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send(HubChannel.StateChange, {
      isAppWindowMaximized: mainWindow.isMaximized(),
    });
  });

  const pageUrl = env.MODE === 'development'
    ? env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  mainWindow.loadURL(pageUrl);
}

/**
 * Handle some CORS issues when requesting video data
 */
function handleCors (): void {
  const playerUrls = {
    urls: [
      'https://*.ttvnw.net/*',
      'https://api.twitch.tv/api/channels/*',
    ],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(playerUrls, (details, callback) => {
    const requestHeaders = {
      ...objectKeysToLowercase(details.requestHeaders),
      origin: 'https://twitch.tv',
      referer: 'https://twitch.tv',
    };

    callback({
      requestHeaders,
    });
  });

  session.defaultSession.webRequest.onHeadersReceived(playerUrls, (details, callback) => {
    const responseHeaders = {
      ...objectKeysToLowercase(details?.responseHeaders ?? {}),
      'access-control-allow-origin': '*',
    };

    callback({
      responseHeaders,
    });
  });
}

/**
 * Disable system media keys handling
 */
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

/**
 * Allow only one running instance of the app
 */
app.on('second-instance', () => {
  if (mainWindow === null) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
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
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Start the app
 */
app.whenReady()
  .then(() => {
    setNativeTheme(config.get('theme.name'));
    handleRendererMessages();
    handleCors();
    createWindow();
  }).catch((error) => {
    console.error('Failed to start the app', error);
  });
