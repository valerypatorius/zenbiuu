import type AccountEntity from '@/entities/AccountEntity';

export interface ModuleAccountStoreSchema {
  accounts: AccountEntity[];
  primary: AccountEntity | null;
}

export interface ModuleAccountStore {
  primaryAccount: AccountEntity | null;
  readonly accounts: AccountEntity[];
  addAccount: (account: AccountEntity) => void;
  removeAccount: (account: AccountEntity) => void;
  getAccountByProperties: (properties: Partial<AccountEntity>) => AccountEntity | undefined;
  resetPrimaryAccount: () => void;
  isPrimaryAccount: (account: AccountEntity) => boolean;
  refreshAccount: (account: AccountEntity, properties: Partial<AccountEntity>) => void;
}

export interface ModuleAccount {
  readonly store: ModuleAccountStore;
  primaryAccount: AccountEntity | null;
  login: (provider: string) => Promise<void>;
  logout: (entity: AccountEntity) => Promise<void>;
}
