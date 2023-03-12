import { createI18n } from 'vue-i18n';
import en from '@/assets/locale/en';
import ru from '@/assets/locale/ru';
import { AppLocaleName } from '@/src/infrastructure/i18n/types';
import { HubApiKey } from '@/hub/types';

function guessAppLocale (): AppLocaleName {
  const appLocale = window[HubApiKey].app.locale;

  if (appLocale.includes('en') === true) {
    return AppLocaleName.En;
  }

  if (appLocale.includes('ru') === true) {
    return AppLocaleName.Ru;
  }

  return AppLocaleName.En;
}

const defaultLocale = guessAppLocale();

export default createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: AppLocaleName.En,
  messages: {
    en,
    ru,
  },
});
