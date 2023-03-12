/**
 * Twitch response for token validation request
 */
export interface TwitchTokenValidationResponse {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
}

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
