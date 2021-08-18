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
