import linkifyHtml from 'linkifyjs/html';
import Worker from '@/src/workers/irc.worker.ts?worker';
import type { ChatEmote, ChatMessage } from '@/types/renderer/chat';
import { escape } from '@/src/utils/utils';
import * as endpoints from '@/src/store/endpoints';
import log from '@/src/utils/log';

/**
 * Close codes types
 */
enum CloseCode {
  Manual = 3000,
  Default = 1005,
  Abnormal = 1006,
};

/**
 * Supported commands
 */
export const COMMANDS = {
  connect: '001',
  disconnect: '-1',
  join: 'JOIN',
  leave: 'PART',
  message: 'PRIVMSG',
};

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
function parseTags (raw: string): {[key: string]: string} {
  const arr = raw
    .split(';')
    .map((pair) => pair.split('='));

  return Object.fromEntries(arr);
}

/**
 * Parse IRC message
 */
function parseMessage (raw: string): {command: string; text: string; channel: string; tags: {[key: string]: string} | null} {
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
function parseEmotes (raw: string, messageText: string): {[key: string]: ChatEmote} | null {
  if (!raw || !messageText) {
    return null;
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
function parseBadges (raw: string): string[] {
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
function parseText (text: string): {value: string; isColored: boolean} {
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

/**
 * Helps to communicate with web worker
 */
class IrcManager {
  worker: Worker;
  isConnected: boolean;
  name: string | null;
  onmessage: ((type: string, message: Record<string, any> | ChatMessage) => void) | null;
  onclose: ((isReconnect: boolean) => void) | null;

  constructor () {
    this.worker = new Worker();
    this.worker.onmessage = this.onWorkerMessage.bind(this);
    this.isConnected = false;

    this.name = null;
    this.onmessage = null;
    this.onclose = null;
  }

  /**
   * Connect to Twitch IRC channel
   */
  connect ({ token, name }: {token: string; name: string}): void {
    if (this.isConnected) {
      return;
    }

    this.name = name;

    this.post('connect', {
      url: endpoints.IRC,
      token,
      name,
    });
  }

  /**
   * Terminate running worker
   */
  disconnect (): void {
    if (!this.isConnected) {
      return;
    }

    this.post('disconnect', {
      code: CloseCode.Manual,
    });
  }

  /**
   * Post message to web worker
   */
  post (action: string, data: WorkerMessageData['data'] = {}): void {
    this.worker.postMessage({
      action,
      data,
    });
  }

  /**
   * Parse message from web worker and call onmessage method
   */
  onWorkerMessage (event: MessageEvent): void {
    /**
     * Do not proceed, if disconnected
     */
    if (event.data.close === true) {
      this.isConnected = false;

      if (typeof this.onclose === 'function') {
        const isReconnect = event.data.code !== CloseCode.Manual;

        this.onclose(isReconnect);
      }

      return;
    }

    const messages = event.data.trim().split(/\n/);

    messages.forEach((message: string) => {
      const parsed = parseMessage(message);

      if (!Object.values(COMMANDS).includes(parsed.command)) {
        return;
      }

      /**
       * Run IRC queue, when connected
       */
      if (parsed.command === COMMANDS.connect) {
        this.isConnected = true;

        this.post('runQueue');
      }

      const data: Record<string, any> | ChatMessage = {};

      /**
       * Prepare chat message data for display
       */
      if (parsed.command === COMMANDS.message) {
        data.text = parseText(parsed.text);

        if (parsed.tags != null) {
          data.id = parsed.tags.id;
          data.author = parsed.tags['display-name'];
          data.emotes = parseEmotes(parsed.tags.emotes, data.text.value);
          data.badges = parseBadges(parsed.tags.badges);
          data.color = parsed.tags.color;
        }
      } else {
        const logData = [];

        if (parsed.command !== COMMANDS.connect) {
          logData.push(parsed.command);
        }

        if (parsed.text) {
          logData.push(parsed.text);
        }

        if (parsed.channel) {
          logData.push(parsed.channel);
        }

        log.message(log.Location.IrcManager, ...logData);
      }

      if (typeof this.onmessage === 'function') {
        this.onmessage(parsed.command, data);
      }
    });
  }
}

const irc = new IrcManager();

export default irc;
