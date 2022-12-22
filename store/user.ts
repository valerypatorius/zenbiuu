export interface UserStoreSchema {
  /** Authorized user token */
  token?: string;

  /** Authorized user id */
  id?: string;

  /** Authorized user name */
  name?: string;

  /** Last token validation date */
  tokenDate?: number;
}

export const UserStoreName = 'user';

export const defaultUserState: UserStoreSchema = {
  token: undefined,
  id: undefined,
  name: undefined,
  tokenDate: 0,
};
