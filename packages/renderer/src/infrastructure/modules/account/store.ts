import type AccountEntity from '@/entities/AccountEntity';
import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';
import ObservableStore from '@/modules/shared/store/ObservableStore';

interface AccountStoreSchema {
  accounts: AccountEntity[];
}

export default class AccountStore extends ObservableStore<AccountStoreSchema> {
  constructor () {
    super('store:account', {
      accounts: [],
    });
  }

  public setAccount (value: AccountEntity): void {
    this.stateProxy.accounts.push(value);
  }

  public getAccount ({ provider, token }: AuthorizedEntity): AccountEntity | undefined {
    return this.stateProxy.accounts.find((account) => account.provider === provider && account.token === token);
  }

  public removeAccount ({ provider, token }: AuthorizedEntity): void {
    const accountIndex = this.stateProxy.accounts.findIndex((account) => account.provider === provider && account.token === token);

    if (accountIndex >= 0) {
      this.stateProxy.accounts.splice(accountIndex, 1);
    }
  }
}
