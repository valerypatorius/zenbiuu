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

  if (store.primaryAccount !== null) {
    connectAccountToProvider(store.primaryAccount);
  }

  function connectAccountToProvider (account: AccountEntity): void {
    providers.getApi(account.provider).connect(account);
  }

  async function login (provider: string): Promise<void> {
    const account = await providers.getApi(provider).login();

    const storedAccount = store.getAccountByProperties({
      id: account.id,
      provider: account.provider,
    });

    if (storedAccount !== undefined) {
      store.refreshAccount(storedAccount, account);
    } else {
      store.addAccount(account);
    }

    store.primaryAccount = account;
  }

  async function logout (entity: AccountEntity): Promise<void> {
    await providers.getApi(entity.provider).logout(entity.token);

    store.removeAccount(entity);

    if (!store.isPrimaryAccount(entity)) {
      return;
    }

    store.resetPrimaryAccount();

    if (store.primaryAccount !== null) {
      connectAccountToProvider(store.primaryAccount);
    }
  }

  return {
    store,
    get primaryAccount () {
      return store.primaryAccount;
    },
    set primaryAccount (value: AccountEntity | null) {
      store.primaryAccount = value;

      if (value !== null) {
        connectAccountToProvider(value);
      }
    },
    login,
    logout,
  };
}
