import { createApp } from 'vue';
import App from '@/src/modules/core/App.vue';
import router from '@/src/infrastructure/router';
import i18n from '@/src/infrastructure/i18n/i18n';
import log from '@/src/utils/log';

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
  .use(router)
  .mount('body');

timer.end = performance.now();

log.message(log.Type.Time, 'Startup', timer.diff);
