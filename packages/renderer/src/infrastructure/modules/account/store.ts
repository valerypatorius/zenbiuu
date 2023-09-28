import { type Account } from './types';
import ObservableStore from '@/modules/shared/ObservableStore';

interface AccountStoreSchema {
  accounts: Account[];
}

export default class AccountStore extends ObservableStore<AccountStoreSchema> {
  constructor () {
    const state = {
      accounts: [],
    };

    const key = 'v2:store:account';

    super(state, key);
  }

  public setAccount (value: Account): void {
    this.observableState.accounts.push(value);
  }
}
