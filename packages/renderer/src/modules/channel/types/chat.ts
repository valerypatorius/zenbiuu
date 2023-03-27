import { type IrcCommand } from '@/src/infrastructure/irc/types';

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
  urls: Record<`${string | number}x`, string>;
}

export interface ChatServiceMessage {
  command: IrcCommand;
  text?: string;
}

/**
 * Chat message data, ready for render
 */
export interface ChatMessage {
  id: string;
  author: string;
  color: string;
  text: string;
  badges: string[];
  isColoredText?: boolean;
}

/**
 * State of logined user in a chat room
 */
export interface ChatUserState {
  name?: string;
  color?: string;
  emoteSets?: string[];

  /** Usually exist when message is posted */
  badges?: string[];
  nonce?: string;
  messageId?: string;
}

/**
 * Base data for BTTV emotes
 */
interface BttvEmoteDataBase {
  id: string;
  code: string;
  imageType: string;
  animated: boolean;
}

/**
 * Default BTTV emote data
 */
export interface BttvEmoteDataDefault extends BttvEmoteDataBase {
  userId: string;
  width: number;
  height: number;
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
export interface FfzEmoteData {
  id: number;
  name: string;
  height: number;
  width: number;
  urls: Record<`${number}`, string>;
}

/**
 * FFZ response for emotes request
 */
export interface FfzChannelEmotes {
  room: unknown;
  sets: Record<`${number}`, {
    emoticons: FfzEmoteData[];
  }>;
}

/**
 * 7tv emote data. Unused fields are not included
 */
export interface SevenTvEmoteData {
  id: string;
  mime: string;
  name: string;
  width: number[];
  height: number[];
  urls: Array<[`${number}`, string]>;
}

/**
 * 7tv response for emotes request
 */
export type SevenTvEmotes = SevenTvEmoteData[];

/**
 * Native Twitch emote data
 */
export interface TwitchEmoteData {
  id: string;
  name: string;
  images: Record<`url_${number}x`, string>;
  format: Array<'static' | 'animated'>;
  scale: Array<'1.0' | '2.0' | '3.0'>;
  theme_mode: Array<'light' | 'dark'>;
}

/**
 * Twitch emotes response
 */
export interface TwitchEmotesResponse {
  data: TwitchEmoteData[];
  template: string;
}
