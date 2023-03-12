import { session } from 'electron';
import { objectKeysToLowercase } from './utils';

const filter = {
  urls: [
    /** Initial playlist */
    'https://usher.ttvnw.net/*',

    /** Video fragments */
    'https://*.hls.ttvnw.net/*',

    /** GQL for playlists access tokens */
    'https://gql.twitch.tv/*',

    /** Web pages */
    'https://www.twitch.tv/*',

    /** CDN with channels config files */
    'https://static.twitchcdn.net/*',
  ],
};

export function handleCors (): void {
  session.defaultSession.webRequest.onHeadersReceived(filter, (details, handler) => {
    const responseHeaders = {
      ...objectKeysToLowercase(details?.responseHeaders ?? {}),
      'access-control-allow-origin': '*',
    };

    handler({
      responseHeaders,
    });
  });
}
