import { createAccountStore } from './store';
import { type ModuleAccountStoreSchema, type ModuleAccount } from './types';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';

export async function createAccount (state: ModuleStateFactoryFn<ModuleAccountStoreSchema>, {
  providers,
}: {
  providers: ProvidersInterface;
}): Promise<ModuleAccount> {
  const store = await createAccountStore(state);

  const primaryAccount = store.getPrimaryAccount();

  if (primaryAccount !== undefined) {
    connectAccountToProvider(primaryAccount);
  }

  function connectAccountToProvider (account: AccountEntity): void {
    providers
      .getApi(account.provider)
      .connect(account.token, account.name);
  }

  function setPrimaryAccount (account: AccountEntity, isNeedConnect = true): void {
    store.setPrimaryAccount(account);

    if (isNeedConnect) {
      connectAccountToProvider(account);
    }
  }

  async function login (provider: string): Promise<void> {
    const account = await providers
      .getApi(provider)
      .login();

    const storedAccount = store.getAccountByProperties({
      id: account.id,
      provider: account.provider,
    });

    if (storedAccount !== undefined) {
      store.refreshAccount(storedAccount, account);
    } else {
      store.addAccount(account);
    }

    setPrimaryAccount(account, false);
  }

  async function logout (entity: AccountEntity): Promise<void> {
    await providers
      .getApi(entity.provider)
      .logout(entity.token);

    store.removeAccount(entity);

    if (!store.isPrimaryAccount(entity)) {
      return;
    }

    const newPrimaryAccount = store.resetPrimaryAccount();

    if (newPrimaryAccount !== undefined) {
      connectAccountToProvider(newPrimaryAccount);
    }
  }

  return {
    login,
    logout,
    getAccounts: store.getAccounts,
    setPrimaryAccount,
    getPrimaryAccount: store.getPrimaryAccount,
    isPrimaryAccount: store.isPrimaryAccount,
  };
}
