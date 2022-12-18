import { reactive } from 'vue';
import { createGlobalState } from '@vueuse/core';

export const useInterfaceState = createGlobalState(() => {
  const state = reactive({
    isLoading: false,
    isSettingsActive: false,
  });

  return {
    state,
  };
});
