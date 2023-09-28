import { createI18n } from 'vue-i18n';
import en from '@/assets/locale/en';
import ru from '@/assets/locale/ru';
import hub from '@/modules/hub';

const app = await hub.service.getAppProperties();

const i18n = createI18n({
  legacy: false,
  locale: app.locale,
  fallbackLocale: 'en',
  messages: {
    en,
    ru,
  },
});

export default i18n;
