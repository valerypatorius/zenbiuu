import { type EmoteEntity } from './EmoteEntity';

export type EmotesReceivedEvent = CustomEvent<{
  id: string;
  emotes: Record<string, EmoteEntity>;
}>;
