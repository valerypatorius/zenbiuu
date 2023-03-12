import { createSharedComposable } from '@vueuse/core';
import { useStore } from './__useStore';
import { ThemeStoreName, defaultThemeState } from '@/src/store/types/theme';
import { setThemeSource } from '@/src/infrastructure/hub/hub';

export const useTheme = createSharedComposable(() => {
  const { state, onUpdate } = useStore(ThemeStoreName, defaultThemeState);

  onUpdate(() => {
    setThemeSource(state.name);
  });

  return {
    state,
  };
});
