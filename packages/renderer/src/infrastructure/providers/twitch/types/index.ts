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

export enum TwitchIrcCommand {
  Connect = '001',
  Disconnect = '-1',
  Clear = 'CLEARCHAT',
  Notice = 'NOTICE',
  HostTarget = 'HOSTTARGET',
  Join = 'JOIN',
  Leave = 'PART',
  Message = 'PRIVMSG',
  GlobalUserState = 'GLOBALUSERSTATE',
  UserState = 'USERSTATE',
  RoomState = 'ROOMSTATE',
}

export interface TwitchIrcMessage {
  command: TwitchIrcCommand;
  channel?: string;
  text?: string;
  tags?: Partial<{
    'badge-info': Array<'moderator' | 'subscriber'>;
    badges: Array<'moderator' | 'subscriber'>;
    'client-nonce': string;
    color: string;
    'display-name': string;
    id: string;
    mod: '0' | '1';
    subscriber: '0' | '1';
    turbo: '0' | '1';
    'first-msg': '0' | '1';
    'emote-only': '0' | '1';
    'user-id': string;
    'tmi-sent-ts': string;
    'room-id': string;
    emotes: Record<string, Array<{ start: number; end: number }>>;
  }>;
}
