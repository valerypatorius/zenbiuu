import type { AccountEntity, ModuleStateFactoryFn } from '@client/shared';
import type { ModuleAccountStore, ModuleAccountStoreSchema } from './types';

export async function createAccountStore(
  createState: ModuleStateFactoryFn<ModuleAccountStoreSchema>,
): Promise<ModuleAccountStore> {
  const { state, save } = await createState('store:account', {
    accounts: [],
    primary: null,
  });

  function addAccount(account: AccountEntity): void {
    state.accounts.push(account);

    save();
  }

  function removeAccount({ provider, token }: AccountEntity): void {
    const accountIndex = state.accounts.findIndex(
      (storedAccount) =>
        storedAccount.provider === provider && storedAccount.token === token,
    );

    if (accountIndex >= 0) {
      state.accounts.splice(accountIndex, 1);
    }

    save();
  }

  function getAccountByProperties(
    properties: Partial<AccountEntity>,
  ): AccountEntity | undefined {
    return state.accounts.find((storedAccount) =>
      Object.entries(properties).every(
        ([key, value]) => storedAccount[key as keyof AccountEntity] === value,
      ),
    );
  }

  function resetPrimaryAccount(): void {
    const fallbackPrimaryAccount = state.accounts[0];

    if (fallbackPrimaryAccount !== undefined) {
      state.primary = fallbackPrimaryAccount;
    } else {
      state.primary = null;
    }

    save();
  }

  function isPrimaryAccount(account: AccountEntity): boolean {
    if (state.primary === null) {
      return false;
    }

    return (
      account.provider === state.primary.provider &&
      account.token === state.primary.token
    );
  }

  function refreshAccount(
    account: AccountEntity,
    properties: Partial<AccountEntity>,
  ): void {
    Object.assign(account, properties);

    save();
  }

  return {
    get primaryAccount() {
      return state.primary;
    },
    set primaryAccount(value: AccountEntity | null) {
      state.primary = value;
    },
    get accounts() {
      return state.accounts;
    },
    addAccount,
    removeAccount,
    getAccountByProperties,
    resetPrimaryAccount,
    isPrimaryAccount,
    refreshAccount,
  };
}
