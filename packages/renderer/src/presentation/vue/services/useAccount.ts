import { createSharedComposable } from '@vueuse/core';
import { computed, inject } from 'vue';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import type AccountEntity from '@/entities/AccountEntity';

export const useAccount = createSharedComposable(() => {
  const account = inject(Injection.Module.Account);

  if (account === undefined) {
    throw new MissingModuleInjection(Injection.Module.Account);
  }

  async function login (provider: string): Promise<void> {
    await account?.login(provider);
  }

  async function logout (entity: AccountEntity): Promise<void> {
    await account?.logout(entity);
  }

  function isPrimaryAccount (entity: AccountEntity): boolean {
    return account?.store.isPrimaryAccount(entity) ?? false;
  }

  return {
    primaryAccount: computed(() => account.store.primaryAccount),
    accounts: account.store.accounts,
    isPrimaryAccount,
    login,
    logout,
  };
});
