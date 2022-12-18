import { ref, watch } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { config, setNativeTheme } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';
import { AppColorScheme } from '@/types/color';

export const useThemeState = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.Theme]>({
    name: AppColorScheme.System,
  });

  const state = toReactive(refState);

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.Theme);

    watch(state, () => {
      // config.set(Module.User, state);

      setNativeTheme(state.name);
    });
  }

  return {
    state,
  };
});
