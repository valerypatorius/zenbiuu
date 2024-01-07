import type AccountEntity from '@/entities/AccountEntity';
import { type EmoteEntity } from '@/entities/EmoteEntity';

export interface ModuleEmotesStoreSchema {
  emotesByChannelId: Record<string, Record<string, EmoteEntity>>;
}

export interface ModuleEmotes {
  getEmotesByChannelId: () => Record<string, Record<string, EmoteEntity>>;
  requestEmotes: (account: AccountEntity, channelId: string) => void;
}
