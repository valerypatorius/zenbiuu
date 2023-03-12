import { createSharedComposable } from '@vueuse/core';
import { type UserStoreSchema } from './types';
import { useStore } from '@/src/infrastructure/store/useStore';
import { uid } from '@/src/utils/utils';

export const DEFAULT_DEVICE_ID = uid();

const defaultUserState: UserStoreSchema = {
  token: undefined,
  id: undefined,
  name: undefined,
  tokenDate: 0,
  deviceId: DEFAULT_DEVICE_ID,
};

export const useUser = createSharedComposable(() => {
  const { state } = useStore('user', defaultUserState);

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
