import type ChatMessage from '@/entities/ChatMessage';
import type AccountEntity from '@/entities/AccountEntity';

export interface ModuleChatStoreSchema {
  messagesByChannelName: Record<string, ChatMessage[]>;
}

export interface ModuleChat {
  join: (account: AccountEntity, channelName: string) => void;
  leave: (account: AccountEntity, channelName: string) => void;
  destroy: () => void;
  getMessagesByChannelName: () => Record<string, ChatMessage[]>;
}
