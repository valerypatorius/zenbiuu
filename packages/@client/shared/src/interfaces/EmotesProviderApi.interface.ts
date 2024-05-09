import type { EmoteEntity } from '../entities';

/**
 * Describes public properties and methods of a single emotes provider
 */
export interface EmotesProviderApiInterface {
  getChannelEmotes: (id: string) => Promise<Record<string, EmoteEntity>>;
}
