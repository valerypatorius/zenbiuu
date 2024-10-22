import { createSharedComposable, refWithControl } from '@vueuse/core';
import { inject, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import MissingModuleInjection from '~/errors/MissingModuleInjection';
import { Injection } from '~/injections';

export const useSettings = createSharedComposable(() => {
  const settings = inject(Injection.Module.Settings);

  if (settings === undefined) {
    throw new MissingModuleInjection(Injection.Module.Settings);
  }

  const { locale } = useI18n();

  const isSettingsOverlayActive = ref(false);

  const isAudioCompressorEnabled = refWithControl(settings.store.isAudioCompressorEnabled, {
    onChanged(value) {
      settings.store.isAudioCompressorEnabled = value;
    },
  });

  const isCompactLayout = refWithControl(settings.store.isCompactLayout, {
    onChanged: (value) => {
      settings.store.isCompactLayout = value;
    },
  });

  const isSidebarEnabled = refWithControl(settings.store.isSidebarEnabled, {
    onChanged: (value) => {
      settings.store.isSidebarEnabled = value;
    },
  });

  const isSmoothScrollEnabled = refWithControl(settings.store.isSmoothScrollEnabled, {
    onChanged: (value) => {
      settings.store.isSmoothScrollEnabled = value;
    },
  });

  watchEffect(() => {
    settings.store.locale = locale.value;
  });

  return {
    isSettingsOverlayActive,
    isAudioCompressorEnabled,
    isCompactLayout,
    isSidebarEnabled,
    isSmoothScrollEnabled,
    toggleOverlay() {
      isSettingsOverlayActive.value = !isSettingsOverlayActive.value;
    },
  };
});
