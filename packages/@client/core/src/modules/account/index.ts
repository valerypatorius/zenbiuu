import { createAccountStore } from './store';
import { type ModuleAccountStoreSchema, type ModuleAccount } from './types';
import {
  type ProvidersInterface,
  type AccountEntity,
  type ModuleStateFactoryFn,
  ProviderEvent,
  type ProviderDisconnectedEvent,
} from '@client/shared';

export async function createAccount(
  state: ModuleStateFactoryFn<ModuleAccountStoreSchema>,
  {
    providers,
  }: {
    providers: ProvidersInterface;
  },
): Promise<ModuleAccount> {
  const store = await createAccountStore(state);

  if (store.primaryAccount !== null) {
    connectAccountToProvider(store.primaryAccount);
  }

  window.addEventListener(ProviderEvent.Disconnect, handleDisconnect as EventListener);

  function connectAccountToProvider(account: AccountEntity): void {
    providers.getApi(account.provider).connect(account);
  }

  function handleDisconnect({ detail }: ProviderDisconnectedEvent): void {
    const disconnectedAccount = store.getAccountByProperties({
      token: detail.token,
      provider: detail.provider,
    });

    if (disconnectedAccount === undefined) {
      return;
    }

    logout(disconnectedAccount, true);
  }

  async function login(provider: string): Promise<void> {
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

  async function logout(entity: AccountEntity, isSkipTokenRevoke = false): Promise<void> {
    if (isSkipTokenRevoke) {
      providers.getApi(entity.provider).disconnect();
    } else {
      await providers.getApi(entity.provider).logout(entity.token);
    }

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
    get primaryAccount() {
      return store.primaryAccount;
    },
    set primaryAccount(value: AccountEntity | null) {
      store.primaryAccount = value;

      if (value !== null) {
        connectAccountToProvider(value);
      }
    },
    login,
    logout,
  };
}
