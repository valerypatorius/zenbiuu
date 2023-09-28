import { type AuthProviderName } from './types';
import ObservableStore from '@/modules/shared/ObservableStore';

interface AuthStoreSchema {
  tokens: Array<{ token: string; provider: AuthProviderName }>;
}

export default class AuthStore extends ObservableStore<AuthStoreSchema> {
  constructor () {
    const state = {
      tokens: [],
    };

    const key = 'v2:store:auth';

    super(state, key);
  }

  public setToken (providerName: AuthProviderName, value: string): void {
    this.observableState.tokens.push({
      provider: providerName,
      token: value,
    });
  }
}
