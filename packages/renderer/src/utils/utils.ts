import { state, platform } from './hub';
import { AppLocaleName } from '@/types/renderer/locale';

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
 * Returns unique id
 */
export function uid (): string {
  const rand = Math.random();
  const now = new Date().getTime();

  return rand.toString(36).substring(2, 15) + now.toString(36).substring(2, 15);
}

/**
 * Returns true, if current platform is Windows
 */
export function isWindows (): boolean {
  return platform === 'win32';
}

/**
 * Returns true, if current platform is MacOS
 */
export function isMac (): boolean {
  return platform === 'darwin';
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
 * Current app version
 */
export function getAppVersion (): string {
  return state.appVersion;
}

/**
 * Current app name
 */
export function getAppName (): string {
  return state.appName;
}

/**
 * Current app locale
 */
export function getAppLocale (): AppLocaleName {
  const locale = state.appLocale;

  if (locale.includes('en')) {
    return AppLocaleName.En;
  }

  if (locale.includes('ru')) {
    return AppLocaleName.Ru;
  }

  return AppLocaleName.En;
}

/**
 * Capitilize first string char
 */
export function capitalizeFirstChar (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
