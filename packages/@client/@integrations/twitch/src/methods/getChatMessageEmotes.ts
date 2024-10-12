import type { EmoteEntity } from '@client/shared';
import type { TwitchIrcMessage } from '../types';

export function getChatMessageEmotes(
  message: TwitchIrcMessage,
): Record<string, EmoteEntity> {
  const text = message.text;

  if (text === undefined || message.tags?.emotes === undefined) {
    return {};
  }

  return Object.entries(message.tags.emotes).reduce<
    Record<string, EmoteEntity>
  >((result, [id, position]) => {
    const name = text.substring(position[0].start, position[0].end + 1);

    result[name] = {
      '1.0x': `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0`,
      '2.0x': `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`,
      '3.0x': `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`,
    };

    return result;
  }, {});
}
