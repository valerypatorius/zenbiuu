export interface LibraryStoreSchema {
  /** Active library sorting */
  sorting: Sorting;
}

export interface SidebarStoreSchema {
  /** Sidebar width */
  width: number;
}

/**
 * Sorting types (ascension or descension)
 */
export enum SortingType {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * Available library sortings
 */
export enum Sorting {
  ViewersDesc = 'viewers-desc',
  ViewersAsc = 'viewers-asc',
  ChannelAsc = 'channel-asc',
  ChannelDesc = 'channel-desc',
  GameAsc = 'game-asc',
  GameDesc = 'game-desc',
  DurationDesc = 'duration-desc',
  DurationAsc = 'duration-asc',
}

/**
 * Twitch response structure
 */
export interface TwitchResponse<T> {
  data: T[];
  pagination: {
    cursor?: '';
  };
}

/**
 * Twitch stream data
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
  tag_ids: string[];
  is_mature: boolean;
}

/**
 * Twitch channel data from search
 * @link https://dev.twitch.tv/docs/api/reference#search-channels
 */
export interface TwitchChannelFromSearch {
  broadcaster_language: string;
  broadcaster_login: string;
  display_name: string;
  game_id: string;
  game_name: string;
  id: string;
  is_live: boolean;
  tags_ids: string[];
  thumbnail_url: string;
  title: string;
  started_at: string;
}

/**
 * Twitch user data
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
  email: string;
  created_at: string;
}

/**
 * Relationship between two Twitch users
 * @link https://dev.twitch.tv/docs/api/reference/#get-followed-channels
 */
export interface TwitchUserFollow {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  followed_at: string;
}
