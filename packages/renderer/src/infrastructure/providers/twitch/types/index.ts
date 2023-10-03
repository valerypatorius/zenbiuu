/**
 * @link https://dev.twitch.tv/docs/authentication/validate-tokens/
 */
export interface TwitchValidTokenProperties {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
}

/**
 * @link https://dev.twitch.tv/docs/api/reference#get-users
 */
export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}
