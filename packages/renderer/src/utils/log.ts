type LogTypeMessage = string;
type LogTypeWarning = string;

/**
 * Log types
 */
const Type: {[key: string]: LogTypeMessage} = {
  Message: 'message',
  Warning: 'warning',
};

/**
 * Log locations types
 */
const Location: {[key: string]: string} = {
  Time: 'Time',
  State: 'State',
  IrcManager: 'IrcManager',
  RequestManager: 'RequestManager',
};

/**
 * Get emoji for message by its type and location
 */
function getEmoji (type: LogTypeMessage | LogTypeWarning, loc: string): string {
  switch (loc) {
    case Location.Time:
      return '⌛';
    case Location.State:
      return '📦';
    case Location.IrcManager:
      return '💬';
    case Location.RequestManager:
      return type === Type.Message ? '👍' : '👎';
    default:
      return '';
  }
}

/**
 * Log common message
 */
function message (loc: string, ...args: any[]): void {
  const data = [
    `${getEmoji(Type.Message, loc)} %c${loc}`,
    'color: #2ecc71;',
    ...args,
  ];

  console.log(...data);
}

/**
 * Log warning message
 */
function warning (loc: string, ...args: any[]): void {
  const data = [
    `${getEmoji(Type.Warning, loc)} %c${loc}`,
    'color: #e67e22;',
    ...args,
  ];

  console.log(...data);
}

export default {
  Location,
  message,
  warning,
};
