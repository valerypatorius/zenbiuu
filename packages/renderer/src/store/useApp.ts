import { createSharedComposable } from '@vueuse/core';
import { useStore } from './__useStore';
import { AppStoreName, defaultAppState } from '@/store/app';

export const useApp = createSharedComposable(() => {
  const { state } = useStore(AppStoreName, defaultAppState);

  return {
    state,
  };
});
