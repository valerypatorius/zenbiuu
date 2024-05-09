import { type EmoteEntity } from './EmoteEntity';

type EmotesReceivedEvent = CustomEvent<{
  id: string;
  emotes: Record<string, EmoteEntity>;
}>;

export default EmotesReceivedEvent;
