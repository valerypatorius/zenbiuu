import { createI18n } from 'vue-i18n';
import en from '@/assets/locale/en';
import ru from '@/assets/locale/ru';
import { config } from '@/src/utils/hub';
import { getAppLocale } from '@/src/utils/utils';
import { Module } from '@/types/schema';

const defaultLocale = getAppLocale();
const { locale: currentLocale } = await config.get(Module.App);

/**
 * If locale is missing in config,
 * set default one
 */
// if (!currentLocale) {
//   config.set(Module.App, defaultLocale);
// }

export default createI18n({
  legacy: false,
  locale: currentLocale ?? defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en,
    ru,
  },
});
