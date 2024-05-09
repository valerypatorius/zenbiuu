import { type EmoteEntity } from '@/entities/EmoteEntity';

/**
 * Describes public properties and methods of a single emotes provider
 */
export default interface EmotesProviderApiInterface {
  getChannelEmotes: (id: string) => Promise<Record<string, EmoteEntity>>;
}
