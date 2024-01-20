import { type EmoteEntity } from './EmoteEntity';

export default interface ChatMessage {
  id: string;
  author: string;
  text: string;
  color?: string;
  isEven?: boolean;
  isModerator?: boolean;
  isSubscriber?: boolean;
  isStreamer?: boolean;
  emotes?: Record<string, EmoteEntity>;
}
