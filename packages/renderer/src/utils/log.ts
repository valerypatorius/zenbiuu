/**
 * Log locations types
 */
enum Type {
  Time = 'Time',
  State = 'State',
  Irc = 'IRC',
  Request = 'Request',
};

/**
 * Get emoji for message by its type and location
 */
function getEmoji (type: Type): string {
  switch (type) {
    case Type.Time:
      return '⌛';
    case Type.State:
      return '📦';
    case Type.Irc:
      return '💬';
    case Type.Request:
      return '🌍';
    default:
      return '';
  }
}

/**
 * Log common message
 */
function message (type: Type, ...args: any[]): void {
  const data = [
    `${getEmoji(type)} %c${type}`,
    'color: #2ecc71;',
    ...args,
  ];

  console.log(...data);
}

/**
 * Log warning message
 */
function warning (type: Type, ...args: any[]): void {
  const data = [
    `${getEmoji(type)} %c${type}`,
    'color: #e67e22;',
    ...args,
  ];

  console.log(...data);
}

export default {
  Type,
  message,
  warning,
};
