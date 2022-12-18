import { ref, watch } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { config } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';

export const useSidebar = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.Sidebar]>({
    width: 300,
  });

  const state = toReactive(refState);

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.Sidebar);

    // watch(state, () => {
    //   config.set(Module.Player, state);
    // });
  }

  function setWidth (value: number): void {
    state.width = value;
  }

  return {
    state,
    setWidth,
  };
});
