export interface ChatStoreSchema {
  /** Chat width in horizontal layout */
  width: number;

  /** Chat height in vertical layout */
  height: number;
}

export const ChatStoreName = 'chat';

export const defaultChatState: ChatStoreSchema = {
  width: 300,
  height: 500,
};
