import ElectronStore from 'electron-store';
import App from './modules/app';
import Window from './modules/window';
import Theme from './modules/theme';
// import { handleCors } from './modules/window/cors';
// import { handleRendererRequests } from './modules/window/handlers';
import { type StoreSchema } from './types/store';
import Hub from './modules/hub';
// import Updater from './modules/updater';

const app = new App();

/**
 * Do not allow creating multiple app instances
 */
if (!app.isAllowAppStart) {
  app.quit();
}

const store = new ElectronStore<StoreSchema>({
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

void (async () => {
  try {
    await app.start();

    window.open({
      // backgroundColor: theme.windowColor,
    });
  } catch (error) {
    hub.destroy();
  }
})();
