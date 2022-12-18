import { readonly, triggerRef, watch } from 'vue';
import { createGlobalState, useAsyncState, watchOnce } from '@vueuse/core';
import { config } from '@/src/utils/hub';
import { Module } from '@/types/schema';

export const useSidebarState = createGlobalState(() => {
  const { state, isReady } = useAsyncState(config.get(Module.Sidebar), {
    width: 300,
  });

  watchOnce(isReady, () => {
    watch(state, () => {
      config.set(Module.Sidebar, state.value);
    });
  });

  function setWidth (value: number): void {
    state.value.width = value;

    triggerRef(state);
  }

  return {
    state: readonly(state),
    setWidth,
  };
});
