import { createSharedComposable, refWithControl } from '@vueuse/core';
import { inject, ref } from 'vue';
import MissingModuleInjection from '~/errors/MissingModuleInjection';
import { Injection } from '~/injections';

export const useSettings = createSharedComposable(() => {
  const settings = inject(Injection.Module.Settings);

  if (settings === undefined) {
    throw new MissingModuleInjection(Injection.Module.Settings);
  }

  const state = ref(false);

  const isAudioCompressorEnabled = refWithControl(
    settings.store.isAudioCompressorEnabled,
    {
      onChanged(value) {
        settings.store.isAudioCompressorEnabled = value;
      },
    },
  );

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

  const isSmoothScrollEnabled = refWithControl(
    settings.store.isSmoothScrollEnabled,
    {
      onChanged: (value) => {
        settings.store.isSmoothScrollEnabled = value;
      },
    },
  );

  return {
    state,
    toggleState() {
      state.value = !state.value;
    },
    isAudioCompressorEnabled,
    isCompactLayout,
    isSidebarEnabled,
    isSmoothScrollEnabled,
  };
});
