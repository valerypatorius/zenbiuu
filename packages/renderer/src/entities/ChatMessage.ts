import { type EmoteEntity } from './EmoteEntity';

export default interface ChatMessage {
  id: string;
  author: string;
  text: string;
  color?: string;
  isModerator?: boolean;
  isSubscriber?: boolean;
  isEven?: boolean;
  emotes?: Record<string, EmoteEntity>;
}
