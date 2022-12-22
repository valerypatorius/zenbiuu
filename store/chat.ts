import { ChatEmote } from '../types/renderer/chat';

export interface ChatStoreSchema {
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
}

export const ChatStoreName = 'chat';

export const defaultChatState: ChatStoreSchema = {
  emotes: {
    bttv: {},
    ffz: {},
    seventv: {},
  },
  width: 300,
  height: 500,
};
