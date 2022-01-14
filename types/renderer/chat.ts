export enum EmoteProvider {
  twitch = 'Twitch',
  bttv = 'BTTV',
  ffz = 'FFZ',
  seventv = '7TV',
};

/**
 * Chat emote
 */
export interface ChatEmote {
  url: string;
  height: number;
}

/**
 * Chat message data, ready for render
 */
export interface ChatMessage {
  id: string;
  author: string;
  color: string;
  text: {
    value: string;
    isColored: boolean;
  };
  badges: string[];
  emotes?: Record<string, ChatEmote>;
  isRemoved?: boolean;
}

/**
 * Base data for BTTV emotes
 */
interface BttvEmoteDataBase {
  id: string;
  code: string;
  imageType: string;
}

/**
 * Default BTTV emote data
 */
export interface BttvEmoteDataDefault extends BttvEmoteDataBase {
  userId: string;
}

/**
 * Shared BTTV emote data
 */
export interface BttvEmoteDataShared extends BttvEmoteDataBase {
  user: {
    id: string;
    name: string;
    displayName: string;
    providerId: string;
  };
}

/**
 * BTTV response for global emotes request
 */
export type BttvGlobalEmotes = BttvEmoteDataDefault[];

/**
 * BTTV response for channel emotes request
 */
export interface BttvChannelEmotes {
  id: string;
  channelEmotes: BttvEmoteDataDefault[];
  sharedEmotes: BttvEmoteDataShared[];
}

/**
 * FFZ emote data. Unused fields are not included
 */
export interface FfzEmoteDataSimple {
  id: number;
  name: string;
  height: number;
  width: number;
  urls: Record<string, string>;
}

/**
 * FFZ response for emotes request
 */
export interface FfzChannelEmotes {
  room: Record<string, any>;
  sets: {
    [key: string]: {
      [key: string]: any;
      emoticons: FfzEmoteDataSimple[];
    };
  };
}

/**
 * 7tv emote data. Unused fields are not included
 */
export interface SevenTvEmoteDataSimple {
  id: string;
  name: string;
  width: number[];
  height: number[];
  urls: Array<[string, string]>;
}

/**
 * 7tv response for emotes request
 */
export type SevenTvEmotes = SevenTvEmoteDataSimple[];

export enum TwitchEmoteFormat {
  Static = 'static',
  Animated = 'animated',
}

export interface TwitchEmote {
  id: string;
  name: string;
  images: {
    url_1x: string;
    url_2x: string;
    url_4x: string;
  };
  format: TwitchEmoteFormat[];
  scale: string[];
  theme_mode: string[];
}

export interface TwitchChannelEmote extends TwitchEmote {
  tier: string;
  emote_type: string;
  emote_set_id: string;
}

export interface TwitchEmotesResponse<T> {
  data: T[];
  template: string;
}
