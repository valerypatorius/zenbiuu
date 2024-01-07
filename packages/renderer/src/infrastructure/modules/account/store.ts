import { type ModuleAccountStoreSchema } from './types';
import type AccountEntity from '@/entities/AccountEntity';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';
import { deleteObjectProperty } from '@/utils/object';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function createAccountStore (createState: ModuleStateFactoryFn<ModuleAccountStoreSchema>) {
  const { state, save } = await createState('store:account', {
    accounts: [],
  });

  function addAccount (account: AccountEntity): void {
    state.accounts.push(account);

    save();
  }

  function removeAccount ({ provider, token }: AccountEntity): void {
    const accountIndex = state.accounts.findIndex((storedAccount) => storedAccount.provider === provider && storedAccount.token === token);

    if (accountIndex >= 0) {
      state.accounts.splice(accountIndex, 1);
    }

    save();
  }

  function getAccountByProperties (properties: Partial<AccountEntity>): AccountEntity | undefined {
    return state.accounts.find((storedAccount) => Object.entries(properties).every(([key, value]) => storedAccount[key as keyof AccountEntity] === value));
  }

  function getAccounts (): AccountEntity[] {
    return state.accounts;
  }

  function getPrimaryAccount (): AccountEntity | undefined {
    return state.primary;
  }

  function setPrimaryAccount (account: AccountEntity): void {
    const storedAccount = getAccountByProperties(account);

    if (storedAccount === undefined) {
      throw new Error('Failed to set primary account', { cause: account });
    }

    state.primary = storedAccount;

    save();
  }

  function resetPrimaryAccount (): AccountEntity | undefined {
    const fallbackPrimaryAccount = state.accounts[0];

    if (fallbackPrimaryAccount !== undefined) {
      state.primary = fallbackPrimaryAccount;

      return state.primary;
    } else {
      deleteObjectProperty(state, 'primary');
    }

    save();
  }

  function isPrimaryAccount (account: AccountEntity): boolean {
    if (state.primary === undefined) {
      return false;
    }

    return account.provider === state.primary.provider && account.token === state.primary.token;
  }

  function refreshAccount (account: AccountEntity, properties: Partial<AccountEntity>): void {
    Object.assign(account, properties);

    save();
  }

  return {
    addAccount,
    removeAccount,
    getAccountByProperties,
    getAccounts,
    getPrimaryAccount,
    setPrimaryAccount,
    resetPrimaryAccount,
    isPrimaryAccount,
    refreshAccount,
  };
}
