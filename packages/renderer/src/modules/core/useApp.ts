import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { createSharedComposable } from '@vueuse/core';
import { type AppStoreSchema } from './types';
import { useStore } from '@/src/infrastructure/store/useStore';
import { type AppLocaleName } from '@/src/infrastructure/i18n/types';
import { updateWindowTitle } from '@/src/infrastructure/router';

const defaultAppState: AppStoreSchema = {
  locale: undefined,
  interfaceSize: 10,
  settings: {
    isAlwaysOnTop: false,
    isBlurEnabled: true,
  },
};

export const useApp = createSharedComposable(() => {
  const { state } = useStore('app', defaultAppState);
  const route = useRoute();
  const { locale } = useI18n();

  setLocale(state.locale);

  function setLocale (value?: AppLocaleName): void {
    if (value === undefined) {
      return;
    }

    locale.value = value;
    state.locale = value;

    updateWindowTitle(route);
  }

  return {
    state,
    setLocale,
  };
});
