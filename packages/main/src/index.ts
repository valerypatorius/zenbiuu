import { session } from 'electron';
import Store from './modules/store';
import App from '@/modules/app';
import Window from '@/modules/window';
import Theme from '@/modules/theme';
import Hub from '@/modules/hub';
import { objectKeysToLowercase } from '@/utils/index';
// import Updater from './modules/updater';

const app = new App();

/**
 * Do not allow creating multiple app instances
 */
if (app.isAllowAppStart === false) {
  app.quit();
}

const store = new Store({
  name: 'v2.store',
  defaults: {
    windowBounds: {
      width: 1280,
      height: 720,
    },
    theme: 'system',
  },
});

const window = new Window(store);

const theme = new Theme(store, window);

// const updater = new Updater();

const hub = new Hub(window, theme);

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
  ],
};

void (async () => {
  try {
    await app.start();

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
    hub.destroy();
  }
})();
