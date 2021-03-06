import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import log from './utils/log';

const timer = {
  start: 0,
  end: 0,
  get diff () {
    return this.end - this.start;
  },
};

timer.start = performance.now();

createApp(App)
  .use(i18n)
  .use(store)
  .use(router)
  .mount('body');

timer.end = performance.now();

log.message(log.Location.Time, 'Startup', timer.diff);
