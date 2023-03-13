export interface ChatStoreSchema {
  /** Chat width in horizontal layout */
  width: number;

  /** Chat height in vertical layout */
  height: number;
}

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
  sets: Record<string, {
    [key: string]: any;
    emoticons: FfzEmoteDataSimple[];
  }>;
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
