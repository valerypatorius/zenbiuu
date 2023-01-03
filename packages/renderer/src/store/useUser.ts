import { createSharedComposable } from '@vueuse/core';
import { useStore } from './__useStore';
import { UserStoreName, defaultUserState, DEFAULT_DEVICE_ID } from '@/store/user';

export const useUser = createSharedComposable(() => {
  const { state } = useStore(UserStoreName, defaultUserState);

  function clear (): void {
    state.id = undefined;
    state.name = undefined;
    state.token = undefined;
    state.tokenDate = 0;
    state.deviceId = DEFAULT_DEVICE_ID;
  }

  return {
    state,
    clear,
  };
});
