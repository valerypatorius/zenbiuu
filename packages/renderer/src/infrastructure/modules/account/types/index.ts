import type AccountEntity from '@/entities/AccountEntity';

export interface ModuleAccountStoreSchema {
  accounts: AccountEntity[];
  primary?: AccountEntity;
}

export interface ModuleAccount {
  login: (provider: string) => Promise<void>;
  logout: (entity: AccountEntity) => Promise<void>;
  getAccounts: () => AccountEntity[];
  setPrimaryAccount: (account: AccountEntity, isNeedConnect?: boolean) => void;
  getPrimaryAccount: () => AccountEntity | undefined;
  isPrimaryAccount: (account: AccountEntity) => boolean;
}
