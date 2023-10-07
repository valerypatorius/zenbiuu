import type AccountEntity from '@/entities/AccountEntity';
import ObservableStore from '@/modules/shared/ObservableStore';

interface Schema {
  accounts: AccountEntity[];
  primary?: AccountEntity;
}

export default class AccountStore extends ObservableStore<Schema> {
  static async build (): Promise<AccountStore> {
    const { name, data } = await AccountStore.prepare<Schema>('store:account', {
      accounts: [],
    });

    return new AccountStore(name, data);
  }

  public addAccount (account: AccountEntity): void {
    this.stateProxy.accounts.push(account);
  }

  public removeAccount ({ provider, token }: AccountEntity): void {
    const accountIndex = this.stateProxy.accounts.findIndex((storedAccount) => storedAccount.provider === provider && storedAccount.token === token);

    if (accountIndex >= 0) {
      this.stateProxy.accounts.splice(accountIndex, 1);
    }
  }

  public getAccountByProperties (properties: Partial<AccountEntity>): AccountEntity | undefined {
    return this.stateProxy.accounts.find((storedAccount) => Object.entries(properties).every(([key, value]) => storedAccount[key as keyof AccountEntity] === value));
  }

  public getPrimaryAccount (): AccountEntity | undefined {
    return this.stateProxy.primary;
  }

  public setPrimaryAccount (account: AccountEntity): void {
    const storedAccount = this.getAccountByProperties(account);

    if (storedAccount === undefined) {
      throw new Error('Failed to set primary account', { cause: account });
    }

    this.stateProxy.primary = storedAccount;
  }

  public resetPrimaryAccount (): AccountEntity | undefined {
    const fallbackPrimaryAccount = this.stateProxy.accounts[0];

    if (fallbackPrimaryAccount !== undefined) {
      this.stateProxy.primary = fallbackPrimaryAccount;

      return this.stateProxy.primary;
    } else {
      delete this.stateProxy.primary;
    }
  }

  public isPrimaryAccount (account: AccountEntity): boolean {
    if (this.stateProxy.primary === undefined) {
      return false;
    }

    return account.provider === this.stateProxy.primary.provider && account.token === this.stateProxy.primary.token;
  }

  public refreshAccount (account: AccountEntity, properties: Partial<AccountEntity>): void {
    Object.assign(account, properties);
  }
}
