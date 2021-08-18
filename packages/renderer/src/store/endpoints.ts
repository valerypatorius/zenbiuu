/**
 * OAuth: validation
 */
export const VALIDATION = 'https://id.twitch.tv/oauth2/validate';

/**
 * OAuth: authorization
 */
export const AUTH = 'https://id.twitch.tv/oauth2/authorize';

/**
 * OAuth: revoke auth token
 */
export const LOGOUT = 'https://id.twitch.tv/oauth2/revoke';

/**
 * Twitch API: get users follows
 * @link https://dev.twitch.tv/docs/api/reference#get-users-follows
 */
export const USERS_FOLLOWS = 'https://api.twitch.tv/helix/users/follows';

/**
 * Get active streams
 * @link https://dev.twitch.tv/docs/api/reference#get-streams
 */
export const STREAMS = 'https://api.twitch.tv/helix/streams';

/**
 * Get users data
 * @link https://dev.twitch.tv/docs/api/reference#get-users
 */
export const USERS = 'https://api.twitch.tv/helix/users';

/**
 * Search channels by query
 * @link https://dev.twitch.tv/docs/api/reference#search-channels
 */
export const SEARCH_CHANNELS = 'https://api.twitch.tv/helix/search/channels';

/**
 * BTTV API: get global emotes
 */
export const BTTV_GLOBAL_EMOTES = 'https://api.betterttv.net/3/cached/emotes/global';

/**
 * BTTV API: get emotes for channel
 */
export const BTTV_CHANNEL_EMOTES = 'https://api.betterttv.net/3/cached/users/twitch';

/**
 * FFZ API: get emotes for channel
 */
export const FFZ_CHANNEL_EMOTES = 'https://api.frankerfacez.com/v1/room';

/**
 * 7tv API: get global emotes
 */
export const SEVENTV_GLOBAL_EMOTES = 'https://api.7tv.app/v2/emotes/global';

/**
  * 7tv API: get emotes for channel
  */
export const SEVENTV_CHANNEL_EMOTES = 'https://api.7tv.app/v2/users';

/**
 * Track stats for earning channel points
 */
export const TRACK_STATS = 'https://spade.twitch.tv/track';

/**
 * IRC websocket
 * @link https://dev.twitch.tv/docs/irc/guide
 */
export const IRC = 'wss://irc-ws.chat.twitch.tv:443';
