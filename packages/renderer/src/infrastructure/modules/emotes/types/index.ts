import type AccountEntity from '@/entities/AccountEntity';
import { type EmoteEntity } from '@/entities/EmoteEntity';

export interface ModuleEmotesStoreSchema {
  emotesByChannelId: Map<string, Record<string, EmoteEntity>>;
}

export interface ModuleEmotesStore {
  readonly emotesByChannelId: Map<string, Record<string, EmoteEntity>>;
  addChannelEmotes: (channelId: string, emotes: Record<string, EmoteEntity>) => void;
}

export interface ModuleEmotes {
  readonly store: ModuleEmotesStore;
  primaryAccount?: AccountEntity;
  requestEmotes: (channelId: string) => void;
}
