import { ChatMessage, ChatEmote } from '../types/renderer/chat';

export interface ChatStoreSchema {
  /** Chat messages */
  messages: ChatMessage[];

  /** Available chat emotes sets */
  emotes: {
    /** BTTV emotes */
    bttv: Record<string, ChatEmote>;

    /** FrankerFacez emotes */
    ffz: Record<string, ChatEmote>;

    /** 7tv emotes */
    seventv: Record<string, ChatEmote>;
  };

  /** Chat width in horizontal layout */
  width: number;

  /** Chat height in vertical layout */
  height: number;

  /** True, if automatic chat scroll should be paused */
  isPaused: boolean;
}

export const ChatStoreName = 'chat';

export const defaultChatState: ChatStoreSchema = {
  messages: [],
  emotes: {
    bttv: {},
    ffz: {},
    seventv: {},
  },
  width: 300,
  height: 500,
  isPaused: false,
};
