import { createSharedComposable } from '@vueuse/core';
import { computed, inject } from 'vue';
import { accountModuleKey } from '../injections';
import { useObservableState } from './useObservableState';
import { useAuth } from './useAuth';
import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';

export const useAccount = createSharedComposable(() => {
  const account = inject(accountModuleKey);

  const { state } = useObservableState(account.store);
  const { onAuthorized, onDeauthorized, deauthorize } = useAuth();

  const accounts = computed(() => state.value.accounts);

  onAuthorized((entity) => {
    /**
     * @todo Handle case, when account has been authorized before
     */
    account.getDataByEntity(entity);
  });

  onDeauthorized((entity) => {
    account.store.removeAccount(entity);
  });

  async function remove (entity: AuthorizedEntity): Promise<void> {
    await deauthorize(entity);
  }

  return {
    accounts,
    remove,
  };
});
