import { type Account } from './types';
import type AccountStore from './store';
import { type ProvidersInterface, type Provider } from '@/providers/types';

export default class AccountService {
  constructor (
    private readonly store: AccountStore,
    private readonly providers: ProvidersInterface,
  ) {
  }

  public async getDataByToken (provider: Provider, token: string): Promise<Account> {
    const providerApi = await this.providers.getApi(provider);
    const data = await providerApi.getAccount(token);

    this.store.setAccount(data);

    return data;
  }
}
