import { createI18n } from 'vue-i18n';
import en from '@/assets/locale/en';
import ru from '@/assets/locale/ru';
import { app } from '@/src/infrastructure/hub/hub';
import { AppLocaleName } from '@/types/renderer/locale';

const defaultLocale = getAppLocale();

function getAppLocale (): AppLocaleName {
  if (app.locale.includes('en') === true) {
    return AppLocaleName.En;
  }

  if (app.locale.includes('ru') === true) {
    return AppLocaleName.Ru;
  }

  return AppLocaleName.En;
}

export default createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en,
    ru,
  },
});
