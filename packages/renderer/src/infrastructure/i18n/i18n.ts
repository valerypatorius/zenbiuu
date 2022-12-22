import { createI18n } from 'vue-i18n';
import en from '@/assets/locale/en';
import ru from '@/assets/locale/ru';
import { store } from '@/src/utils/hub';
import { getAppLocale } from '@/src/utils/utils';
import { AppStoreName } from '@/store/app';

const appState = await store.get(AppStoreName);

const currentLocale = appState.locale;
const defaultLocale = getAppLocale();

/**
 * If locale is missing in config,
 * set default one
 */
if (currentLocale === undefined) {
  store.set(AppStoreName, {
    ...appState,
    locale: defaultLocale,
  });
}

export default createI18n({
  legacy: false,
  locale: currentLocale ?? defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en,
    ru,
  },
});
