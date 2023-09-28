import { createSharedComposable } from '@vueuse/core';
import { computed } from 'vue';
import { useObservableState } from './useObservableState';
import account from '@/modules/account';

export const useAccount = createSharedComposable(() => {
  const { state } = useObservableState(account.store);

  const accounts = computed(() => state.value.accounts);

  return {
    accounts,
  };
});
