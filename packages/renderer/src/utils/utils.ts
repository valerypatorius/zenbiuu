import { HubApiKey } from '@/hub/types';

/**
 * Returns unique id
 */
export function uid (): string {
  const rand = Math.random();
  const now = new Date().getTime();

  return rand.toString(36).substring(2, 15) + now.toString(36).substring(2, 15);
}

/**
 * Returns url to public folder.
 * Location is used to support both development and production environments
 */
export function publicPath (filename: string): string {
  return `${window.location.origin}/${filename}`;
}

/**
 * Get current unixtime in seconds
 */
export function getCurrentUnixTime (): number {
  return Math.floor(new Date().getTime() / 1000.0);
}

/**
 * Returns true, if current platform is Windows
 * @todo move to useHub composable
 */
export function isWindows (): boolean {
  return window[HubApiKey].getState().platform === 'win32';
}

/**
 * Returns true, if current platform is MacOS
 * @todo move to useHub composable
 */
export function isMac (): boolean {
  return window[HubApiKey].getState().platform === 'darwin';
}

/**
 * Escape unsafe sybmols in text string
 */
export function escape (string: string): string {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Capitilize first string char
 */
export function capitalizeFirstChar (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Returns an object, where array items frequency is recorded
 */
export function getArrayItemsFrequencyMap (arr: string[]): Record<string, number> {
  return arr.reduce<Record<string, number>>((result, value) => {
    result[value] = result[value] !== undefined ? result[value] + 1 : 1;

    return result;
  }, {});
}

/**
 * Returns an array of strings, sorted by these strings frequency
 */
export function sortArrayByFrequency (arr: string[]): string[] {
  return Object.entries(getArrayItemsFrequencyMap(arr))
    .sort((a, b) => b[1] - a[1])
    .map(([value, frequency]) => value);
}

/**
 * Chunks an array into smaller arrays of a specified size
 */
export function splitArrayIntoChunks<T> (arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
}
