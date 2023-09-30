import AccountStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';

export default class Account {
  public readonly store = new AccountStore();

  constructor (
    private readonly providers: ProvidersInterface,
  ) {
  }

  public async getDataByEntity (entity: AuthorizedEntity): Promise<AccountEntity> {
    const storedAccount = this.store.getAccount(entity);

    if (storedAccount !== undefined) {
      return storedAccount;
    }

    const providerApi = await this.providers.getApi(entity.provider);
    const data = await providerApi.getAccount(entity.token);

    this.store.setAccount(data);

    return data;
  }
}
