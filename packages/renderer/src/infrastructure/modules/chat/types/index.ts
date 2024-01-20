import type ChatMessage from '@/entities/ChatMessage';
import type AccountEntity from '@/entities/AccountEntity';

export interface ModuleChatStoreSchema {
  messagesByChannelName: Map<string, ChatMessage[]>;
}

export interface ModuleChatStore {
  readonly messagesByChannelName: Map<string, ChatMessage[]>;
  addChannelMessage: (channelName: string, message: ChatMessage) => void;
  clearChannelMessages: (channelName: string) => void;
  clearAll: () => void;
}

export interface ModuleChat {
  readonly store: ModuleChatStore;
  primaryAccount?: AccountEntity;
  join: (channelName: string) => void;
  leave: (channelName: string) => void;
  destroy: () => void;
}
