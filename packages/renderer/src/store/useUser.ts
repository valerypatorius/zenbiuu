import { createSharedComposable } from '@vueuse/core';
import { useStore } from './__useStore';
import { UserStoreName, defaultUserState } from '@/store/user';

export const useUser = createSharedComposable(() => {
  const { state } = useStore(UserStoreName, defaultUserState);

  function clear (): void {
    state.id = undefined;
    state.name = undefined;
    state.token = undefined;
    state.tokenDate = 0;
  }

  return {
    state,
    clear,
  };
});
