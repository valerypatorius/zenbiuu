/**
 * Transforms all object keys to lowercase
 */
export function objectKeysToLowercase (obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
}
