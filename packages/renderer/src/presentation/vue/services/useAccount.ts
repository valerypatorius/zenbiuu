import { createSharedComposable } from '@vueuse/core';
import { computed, inject } from 'vue';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useObservableState } from './useObservableState';
import type Provider from '@/entities/Provider';
import type AccountEntity from '@/entities/AccountEntity';

export const useAccount = createSharedComposable(() => {
  const account = inject(Injection.Module.Account);

  if (account === undefined) {
    throw new MissingModuleInjection(Injection.Module.Account);
  }

  const { state } = useObservableState(account.store);

  const accounts = computed(() => state.value.accounts);

  const hasPrimaryAccount = computed(() => state.value.primary !== undefined);

  async function login (provider: Provider): Promise<void> {
    await account?.login(provider);
  }

  async function logout (entity: AccountEntity): Promise<void> {
    await account?.logout(entity);
  }

  /**
   * @todo Maybe do not allow calling store methods from composables?
   */
  function isPrimaryAccount (entity: AccountEntity): boolean {
    return account?.store.isPrimaryAccount(entity) ?? false;
  }

  async function setPrimaryAccount (entity: AccountEntity): Promise<void> {
    await account?.setPrimaryAccount(entity);
  }

  return {
    accounts,
    login,
    logout,
    isPrimaryAccount,
    hasPrimaryAccount,
    setPrimaryAccount,
  };
});
