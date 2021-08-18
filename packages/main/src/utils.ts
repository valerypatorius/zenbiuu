/**
 * Get access token from specified url
 */
export function getAccessTokenFromTwitchAuthUrl (url: string): string | null {
  const modifiedUrl = url.replace('#', '?');
  const urlObject = new URL(modifiedUrl);
  const result = urlObject.searchParams.get('access_token');

  return result;
}

/**
 * Transforms all object keys to lowercase
 */
export function objectKeysToLowercase (obj: Record<string, any>): Record<string, any> {
  if (!obj) {
    return {};
  }

  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
}
