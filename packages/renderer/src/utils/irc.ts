import linkifyHtml from 'linkify-html';
import type { ChatEmote } from '@/src/modules/channel/types/chat';
import { escape } from '@/src/utils/utils';

/**
 * Supported message author badges
 */
const BADGES = [
  'moderator',
  'subscriber',
  'partner',
  'broadcaster',
];

/**
 * List of regular expressions
 */
const REGEXP: {[key: string]: RegExp} = {
  tags: /(?<tags>[^\s]+)/,
  command: /(.+tmi\.twitch\.tv\s)(?<command>[^\s]+)/,
  text: /(\s:)(?<text>.*)$/,
  channel: /#(?<channel>.+)$/,
};

/**
 * Parse message tags string
 */
export function parseTags (raw: string): {[key: string]: string} {
  const arr = raw
    .split(';')
    .map((pair) => pair.split('='));

  return Object.fromEntries(arr);
}

/**
 * Parse IRC message
 */
export function parseMessage (raw: string): {command: string; text: string; channel: string; tags: {[key: string]: string} | null} {
  let message = raw.trim();
  let tags = null;

  const matches: {[key: string]: RegExpMatchArray | null} = {};

  /**
   * Get message tags and remove them from message
   */
  if (message.startsWith('@')) {
    message = message.replace('@', '');

    matches.tags = message.match(REGEXP.tags);

    tags = parseTags(matches.tags?.groups != null ? matches.tags.groups.tags : '');
    message = message.replace(REGEXP.tags, '').trim();
  }

  matches.command = message.match(REGEXP.command);
  matches.text = message.match(REGEXP.text);
  matches.channel = message.match(REGEXP.channel);

  const command = matches.command?.groups != null ? matches.command.groups.command : '';
  const text = matches.text?.groups != null ? matches.text.groups.text : '';
  const channel = matches.channel?.groups != null ? matches.channel.groups.channel : '';

  return {
    command,
    text,
    tags,
    channel,
  };
}

/**
 * Parse message text for Twitch emotes
 */
export function parseEmotes (raw: string, messageText: string): Record<string, ChatEmote> | undefined {
  if (raw.length === 0 || messageText.length === 0) {
    return undefined;
  }

  const result: {[key: string]: ChatEmote} = {};

  const data = Object.fromEntries(raw
    .split('/')
    .map((item) => item.split(':')).map(([id, pos]) => (
      [
        id,
        pos
          .split(',')
          .map((p) => p.split('-').map((n) => parseInt(n, 10))),
      ]
    )));

  Object.entries(data).forEach(([id, positions]) => {
    const [start, end] = positions[0];
    const emoteNameFromText = messageText.slice(start, end + 1);
    const size = window.devicePixelRatio > 1 ? '2.0' : '1.0';

    result[emoteNameFromText] = {
      url: `https://static-cdn.jtvnw.net/emoticons/v1/${id}/${size}`,
      height: 28,
    };
  });

  return result;
}

/**
 * Parse author badges tag
 */
export function parseBadges (raw: string): string[] {
  if (typeof raw !== 'string') {
    return [];
  }

  return raw
    .split(',')
    .map((badge) => badge.split('/')[0])
    .filter((badge) => BADGES.includes(badge));
}

/**
 * Parse message text:
 * - purify it from unsafe symbols;
 * - find links;
 * - check for colored text;
 */
export function parseText (text: string): {value: string; isColored: boolean} {
  const coloredStringStart = 'ACTION';
  const coloredStringEnd = '';

  const cleanText = text
    .replace(coloredStringStart, '')
    .replace(coloredStringEnd, '')
    .trim();

  return {
    value: linkifyHtml(escape(cleanText), {
      className: 'link',
      defaultProtocol: 'https',
      target: '_self',
    }),
    isColored: text.startsWith(coloredStringStart) && text.endsWith(coloredStringEnd),
  };
}
