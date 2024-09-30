import { session } from 'electron';
import { HubChannel, objectKeysToLowercase } from '@zenbiuu/shared';
import { createApp } from './app';
import { createStore } from './store';
import { createTheme } from './theme';
import { createWindow } from './window';
import { createHub } from './hub';
// import { createUpdater } from './updater';

const app = createApp();

/**
 * Do not allow creating multiple app instances
 */
if (!app.isAllowAppStart) {
  app.quit();
}

const store = createStore();

const window = createWindow(store);

const theme = createTheme(store);

// // const updater = createUpdater();

const hub = createHub(window, theme);

/**
 * @todo Make pretty
 */
const filter = {
  urls: [
    /** Initial playlist */
    'https://usher.ttvnw.net/*',

    /** Video fragments */
    'https://*.hls.ttvnw.net/*',

    /** GQL for playlists access tokens */
    'https://gql.twitch.tv/*',

    /** Web pages */
    'https://www.twitch.tv/*',

    /** CDN with channels config files */
    'https://static.twitchcdn.net/*',
    'https://assets.twitch.tv/*',
  ],
};

void (async () => {
  try {
    await app.start((instance) => {
      instance.on('second-instance', (event, commandLine) => {
        if (window.isMinimized) {
          window.restore();
        }

        window.focus();

        const link = commandLine.pop();

        if (link === undefined) {
          return;
        }

        window.send(HubChannel.InterceptedLink, link);
      });

      instance.on('open-url', (event, link) => {
        window.send(HubChannel.InterceptedLink, link);
      });

      /**
       * Activate window on Mac, if no other windows are opened
       */
      instance.on('activate', () => {
        // if (Window.Main === null) {
        //   createAppWindow();
        // }
      });
    });

    /**
     * Deal with CORS
     */
    session.defaultSession.webRequest.onHeadersReceived(filter, (details, handler) => {
      const responseHeaders = {
        ...objectKeysToLowercase(details?.responseHeaders ?? {}),
        'access-control-allow-origin': '*',
      };

      handler({
        responseHeaders,
      });
    });

    window.open({
      // backgroundColor: theme.windowColor,
    });
  } catch (error) {
    console.error(error);

    hub.destroy();
  }
})();
