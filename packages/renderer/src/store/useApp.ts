import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { createSharedComposable } from '@vueuse/core';
import { useStore } from './__useStore';
import { AppStoreName, defaultAppState } from '@/src/store/types/app';
import { AppLocaleName } from '@/src/infrastructure/i18n/types';
import { updateWindowTitle } from '@/src/router/index';

export const useApp = createSharedComposable(() => {
  const { state } = useStore(AppStoreName, defaultAppState);
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
