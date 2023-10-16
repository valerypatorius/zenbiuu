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
 * Twitch API response structure
 */
export interface TwitchResponse<T> {
  data: T[];
  pagination?: {
    cursor?: string;
  };
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
  created_at: string;
}

/**
 * @link https://dev.twitch.tv/docs/api/reference#get-streams
 */
export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tags: string[];
  is_mature: boolean;
}

/**
 * @link https://dev.twitch.tv/docs/api/reference/#get-followed-channels
 */
export interface TwitchFollowedChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  followed_at: string;
}

export interface TwitchPlaylistAccessTokenResponse {
  data: {
    streamPlaybackAccessToken: {
      signature: string;
      value: string;
    };
  };
  extensions: {
    durationMilliseconds: number;
    operationName: string;
    requestID: string;
  };
}
