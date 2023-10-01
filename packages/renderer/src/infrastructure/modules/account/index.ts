import AccountStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';

export default class Account {
  readonly #store = new AccountStore();

  constructor (
    private readonly providers: ProvidersInterface,
  ) {
  }

  public get store (): AccountStore {
    return this.#store;
  }

  public async getDataByEntity (entity: AuthorizedEntity): Promise<AccountEntity> {
    const storedAccount = this.#store.getAccount(entity);

    if (storedAccount !== undefined) {
      return storedAccount;
    }

    const providerApi = await this.providers.getApi(entity.provider);
    const data = await providerApi.getAccount(entity.token);

    this.#store.setAccount(data);

    return data;
  }

  public removeAccountForEntity (entity: AuthorizedEntity): void {
    this.#store.removeAccount(entity);
  }
}
