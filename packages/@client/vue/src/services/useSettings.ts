import { createSharedComposable } from '@vueuse/core';
import { ref } from 'vue';

export const useSettings = createSharedComposable(() => {
  const state = ref(false);

  function toggleState(): void {
    state.value = !state.value;
  }

  return {
    state,
    toggleState,
  };
});
