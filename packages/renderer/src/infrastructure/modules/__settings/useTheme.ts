import { createSharedComposable } from '@vueuse/core';
import { type ThemeStoreSchema } from './types';
import { useStore } from '@/src/infrastructure/store/useStore';
import { useHub } from '@/src/infrastructure/hub/useHub';

const defaultThemeState: ThemeStoreSchema = {
  name: 'system',
};

export const useTheme = createSharedComposable(() => {
  const { state, onUpdate } = useStore('theme', defaultThemeState);
  const { setThemeSource } = useHub();

  onUpdate(() => {
    setThemeSource(state.name);
  });

  return {
    state,
  };
});
