export enum TwitchIrcCommand {
  Connect = '001',
  Disconnect = '-1',
  Clear = 'CLEARCHAT',
  Notice = 'NOTICE',
  HostTarget = 'HOSTTARGET',
  Join = 'JOIN',
  Leave = 'PART',
  Message = 'PRIVMSG',
  GlobalUserState = 'GLOBALUSERSTATE',
  UserState = 'USERSTATE',
  RoomState = 'ROOMSTATE',
}

export interface TwitchIrcMessage {
  command: TwitchIrcCommand;
  channel?: string;
  text?: string;
  tags?: Partial<{
    'badge-info': Array<'moderator' | 'subscriber'>;
    badges: Array<'moderator' | 'subscriber'>;
    'client-nonce': string;
    color: string;
    'display-name': string;
    id: string;
    mod: '0' | '1';
    subscriber: '0' | '1';
    turbo: '0' | '1';
    'first-msg': '0' | '1';
    'emote-only': '0' | '1';
    'user-id': string;
    'tmi-sent-ts': string;
    'room-id': string;
    emotes: Record<string, Array<{ start: number; end: number }>>;
  }>;
}

/**
 * Supported message author badges
 */
const SUPPORTED_BADGES = [
  'moderator',
  'subscriber',
  'partner',
  'broadcaster',
];

/**
 * Returns true, if array of enums includes specified string.
 * Helps to deal with types
 */
function isEnumArrayIncludesString<T extends string> (str: string, arr: T[]): str is T {
  return arr.includes(str as T);
}

/**
 * Parse IRC message command
 */
function parseCommand (source: string): { name: TwitchIrcCommand; channel?: string } | undefined {
  const globalCommands = [
    TwitchIrcCommand.Connect,
    TwitchIrcCommand.Disconnect,
    TwitchIrcCommand.GlobalUserState,
  ];

  const roomCommands = [
    TwitchIrcCommand.Join,
    TwitchIrcCommand.Leave,
    TwitchIrcCommand.Notice,
    TwitchIrcCommand.Clear,
    TwitchIrcCommand.HostTarget,
    TwitchIrcCommand.Message,
    TwitchIrcCommand.UserState,
    TwitchIrcCommand.RoomState,
  ];

  const [name, channel] = source.trim().split(' ');

  /**
   * Global commands do not contain channel information,
   * so only command name is returned
   */
  if (isEnumArrayIncludesString(name, globalCommands)) {
    return {
      name,
    };
  }

  /**
   * Room commands, on the other hand, should return it
   */
  if (isEnumArrayIncludesString(name, roomCommands)) {
    return {
      name,
      channel,
    };
  }
}

/**
 * Parse IRC message's badges string and return list of badges names
 */
function parseBadges (source: string): string[] {
  const result: string[] = [];
  const badges = source.split(',');

  badges.forEach((badge) => {
    const [name] = badge.split('/');

    if (SUPPORTED_BADGES.includes(name)) {
      result.push(name);
    }
  });

  return result;
}

/**
 * Parse emotes positions in message text.
 * Not really necessary, because in the end all emotes names are simply replaced with String.replace() call
 */
function parseEmotes (source: string): Record<string, Array<{ start: number; end: number }>> {
  const result: Record<string, Array<{ start: number; end: number }>> = {};
  const emotes = source.split('/');

  emotes.forEach((emote) => {
    const [emoteId, occurrences] = emote.split(':');

    /**
     * The list of position objects that identify
     * the location of the emote in the chat message
     */
    const positions = occurrences.split(',');

    result[emoteId] = positions.reduce<Array<{ start: number; end: number }>>((res, position) => {
      const [start, end] = position.split('-');

      res.push({
        start: parseInt(start),
        end: parseInt(end),
      });

      return res;
    }, []);
  });

  return result;
}

/**
 * Entry point for message tags parsing
 */
function parseTags (source: string): Record<string, any> {
  const result: Record<string, any> = {};
  const chunks = source.split(';');

  chunks.forEach((chunk) => {
    const [key, value = ''] = chunk.split('=');

    if (value.length === 0) {
      return result;
    }

    switch (key) {
      /** E.g. badges=staff/1,broadcaster/1,turbo/1 */
      case 'badges':
      case 'badge-info':
        result[key] = parseBadges(value);
        break;
      /** E.g. emotes=25:0-4,12-16/1902:6-10 */
      case 'emotes':
        result[key] = parseEmotes(value);
        break;
      /** E.g. emote-sets=0,33,50,237 */
      case 'emote-sets':
        result[key] = value.split(',');
        break;
      default:
        result[key] = value;
    }
  });

  return result;
}

/**
 * Does not really parse text, because text displaying is chat's responsibility.
 * But we can mark it as undefined to distinguish chat messages from service messages
 */
function parseText (source: string): string | undefined {
  const result = source.trim();

  return result.length > 0 ? result : undefined;
}

/**
 * Parse incoming IRC message
 * @see https://dev.twitch.tv/docs/irc/example-parser/
 */
export function parseMessage (message: string): TwitchIrcMessage | undefined {
  const DIVIDER = ' ';

  /**
   * Cursor position increments as we parse a message
   */
  let cursor = 0;

  let text: TwitchIrcMessage['text'];
  let tags: TwitchIrcMessage['tags'];

  /**
   * Start selection from start and check for tags section
   */
  if (message[cursor] === '@') {
    const cursorEnd = message.indexOf(DIVIDER);

    tags = parseTags(message.slice(1, cursorEnd));

    cursor = cursorEnd + 1;
  }

  /**
   * Skip source section and move to the next section
   */
  if (message[cursor] === ':') {
    cursor = message.indexOf(DIVIDER, cursor) + 1;
  }

  /**
   * Select text between source and text
   */
  let cursorEnd = message.indexOf(':', cursor);

  /**
   * If text does not exist, assume that the rest of a message is command
   */
  if (cursorEnd === -1) {
    cursorEnd = message.length;
  }

  const command = parseCommand(message.slice(cursor, cursorEnd));

  /**
   * Do not proceed, if commant is not supported
   */
  if (command === undefined) {
    return;
  }

  /**
   * Finally move to text section
   */
  if (cursorEnd < message.length) {
    cursor = cursorEnd + 1;
    text = parseText(message.slice(cursor));
  }

  return {
    command: command.name,
    channel: command.channel?.replace('#', ''),
    text,
    tags,
  };
}
