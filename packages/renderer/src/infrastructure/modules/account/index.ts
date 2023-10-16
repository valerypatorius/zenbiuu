import AccountStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';

export default class Account {
  #store: AccountStore;

  private constructor (
    store: AccountStore,
    private readonly providers: ProvidersInterface,
  ) {
    this.#store = store;
  }

  static async build (providers: ProvidersInterface): Promise<Account> {
    const store = await AccountStore.build();

    const primaryAccount = store.getPrimaryAccount();

    if (primaryAccount !== undefined) {
      Account.connectAccountToProvider(primaryAccount, providers);
    }

    return new Account(store, providers);
  }

  static connectAccountToProvider (account: AccountEntity, providers: ProvidersInterface): void {
    const providerApi = providers.getApi(account.provider);

    providerApi.connect(account.token, account.name);
  }

  public get store (): AccountStore {
    return this.#store;
  }

  public async login (provider: string): Promise<void> {
    const providerApi = this.providers.getApi(provider);
    const account = await providerApi.login();
    const storedAccount = this.#store.getAccountByProperties({
      id: account.id,
      provider: account.provider,
    });

    if (storedAccount !== undefined) {
      this.#store.refreshAccount(storedAccount, account);
    } else {
      this.#store.addAccount(account);
    }

    this.setPrimaryAccount(account, false);
  }

  public async logout (entity: AccountEntity): Promise<void> {
    const providerApi = this.providers.getApi(entity.provider);

    await providerApi.logout(entity.token);

    this.#store.removeAccount(entity);

    if (!this.#store.isPrimaryAccount(entity)) {
      return;
    }

    const newPrimaryAccount = this.#store.resetPrimaryAccount();

    if (newPrimaryAccount !== undefined) {
      Account.connectAccountToProvider(newPrimaryAccount, this.providers);
    }
  }

  public setPrimaryAccount (account: AccountEntity, isNeedConnect = true): void {
    this.#store.setPrimaryAccount(account);

    if (isNeedConnect) {
      Account.connectAccountToProvider(account, this.providers);
    }
  }
}
