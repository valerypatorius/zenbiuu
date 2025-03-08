import { createI18n } from 'vue-i18n';
import en from '~/assets/locale/en';
import ru from '~/assets/locale/ru';

export function getI18n(locale: string, fallbackLocale = 'en'): ReturnType<typeof createI18n> {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale,
    messages: {
      en,
      ru,
    },
  });
}
