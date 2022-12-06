import { createI18n } from 'vue-i18n';
import en from '@/assets/locale/en';
import ru from '@/assets/locale/ru';
import { config } from '@/src/utils/hub';
import { getAppLocale } from '@/src/utils/utils';
import { AppLocaleName } from '@/types/renderer/locale';

const defaultLocale = getAppLocale();
const currentLocale: AppLocaleName | null = await config.get('app.locale');

/**
 * If locale is missing in config,
 * set default one
 */
if (!currentLocale) {
  config.set('app.locale', defaultLocale);
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
