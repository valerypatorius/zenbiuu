/**
 * Parse a string and return a primitive value
 * @param value - string to parse
 */
export function parseString(value: string): string | number | boolean | null | undefined {
  const numericValue = Number(value);
  const isValidNumber = !Number.isNaN(numericValue);

  if (isValidNumber) {
    return numericValue;
  }

  switch (value) {
    case 'undefined':
      return undefined;
    case 'null':
      return null;
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return value;
  }
}

/**
 * Converts object to string, which can be used as location query
 * @param obj - object to convert
 */
export function convertObjectToLocationQuery(obj: Record<string, string | number | boolean>): string {
  return Object.entries(obj)
    .map(
      ([
        key,
        value,
      ]) => `${key}=${value.toString()}`,
    )
    .join('&');
}

/**
 * Returns simple unique id
 */
export function uid(): string {
  const rand = Math.random();
  const now = new Date().getTime();

  return rand.toString(36).substring(2, 15) + now.toString(36).substring(2, 15);
}

/**
 * Capitalize first letter of a string
 * @param source - source string
 */
export function capitalize(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1);
}
