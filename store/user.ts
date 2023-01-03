import { uid } from '../utils/utils';

export interface UserStoreSchema {
  /** Authorized user token */
  token?: string;

  /** Authorized user id */
  id?: string;

  /** Authorized user name */
  name?: string;

  /** Last token validation date */
  tokenDate?: number;

  /** Random device id */
  deviceId: string;
}

export const UserStoreName = 'user';

export const DEFAULT_DEVICE_ID = uid();

export const defaultUserState: UserStoreSchema = {
  token: undefined,
  id: undefined,
  name: undefined,
  tokenDate: 0,
  deviceId: DEFAULT_DEVICE_ID,
};
