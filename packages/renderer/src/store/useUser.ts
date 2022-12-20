import { ref } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { config } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';

export const useUser = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.User]>({
    token: undefined,
    id: undefined,
    name: undefined,
    tokenDate: 0,
  });

  const state = toReactive(refState);

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.User);

    // watch(state, () => {
    //   config.set(Module.User, state);
    // });
  }

  return {
    state,
  };
});
