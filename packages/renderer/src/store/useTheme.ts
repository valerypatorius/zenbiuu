import { createSharedComposable } from '@vueuse/core';
import { useStore } from './__useStore';
import { ThemeStoreName, defaultThemeState } from '@/store/theme';
import { setNativeTheme } from '@/src/utils/hub';

export const useTheme = createSharedComposable(() => {
  const { state, onUpdate } = useStore(ThemeStoreName, defaultThemeState);

  onUpdate(() => {
    setNativeTheme(state.name);
  });

  return {
    state,
  };
});
