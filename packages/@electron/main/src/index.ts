import { session } from 'electron';
import { objectKeysToLowercase } from '@zenbiuu/shared';
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
    console.log(3);
    await app.start();

    console.log(4);

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
