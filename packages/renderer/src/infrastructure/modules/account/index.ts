import AccountStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type Provider from '@/entities/Provider';

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
      await Account.authorizeProviderByAccount(primaryAccount, providers);
    }

    return new Account(store, providers);
  }

  static async authorizeProviderByAccount (account: AccountEntity, providers: ProvidersInterface): Promise<void> {
    const providerApi = await providers.getApi(account.provider);

    providerApi.authorize(account.token);
  }

  public get store (): AccountStore {
    return this.#store;
  }

  public async login (provider: Provider): Promise<void> {
    const providerApi = await this.providers.getApi(provider);
    const account = await providerApi.login();

    this.#store.addAccount(account);
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

    await Account.authorizeProviderByAccount(account, this.providers);
  }
}
