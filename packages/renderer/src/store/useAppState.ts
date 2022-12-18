import { ref } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { config } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';

export const useAppState = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.App]>({
    locale: null,
    interfaceSize: 10,
    settings: {
      isAlwaysOnTop: false,
      isBlurEnabled: true,
    },
  });

  const state = toReactive(refState);

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.App);

    // watch(state, () => {
    //   config.set(Module.User, state);
    // });
  }

  return {
    state,
  };
});
