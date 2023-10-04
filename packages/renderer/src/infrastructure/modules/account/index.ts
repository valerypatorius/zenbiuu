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

    /**
     * @todo Do we really need to wait for connection?
     */
    if (primaryAccount !== undefined) {
      await Account.connectProviderToAccount(primaryAccount, providers);
    }

    return new Account(store, providers);
  }

  static async connectProviderToAccount (account: AccountEntity, providers: ProvidersInterface): Promise<void> {
    const providerApi = await providers.getApi(account.provider);

    await providerApi.connect(account.token);
  }

  public get store (): AccountStore {
    return this.#store;
  }

  public async login (provider: string): Promise<void> {
    const providerApi = await this.providers.getApi(provider);
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

    this.#store.setPrimaryAccount(account);
  }

  public async logout (entity: AccountEntity): Promise<void> {
    const providerApi = await this.providers.getApi(entity.provider);

    await providerApi.logout(entity.token);

    this.#store.removeAccount(entity);

    if (this.#store.isPrimaryAccount(entity)) {
      this.#store.resetPrimaryAccount();
    }
  }

  public async setPrimaryAccount (account: AccountEntity): Promise<void> {
    this.#store.setPrimaryAccount(account);

    await Account.connectProviderToAccount(account, this.providers);
  }
}
