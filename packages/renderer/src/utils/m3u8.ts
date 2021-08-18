import { env } from '@/src/utils/hub';
import request from '@/src/utils/request';
import type { AccessTokenResponse } from '@/types/renderer/player';

/**
 * Form playlist url from passed data
 */
function formPlaylistUrl ({
  channel,
  sig,
  token,
}: {
  channel: string;
  sig: string;
  token: string;
}): string {
  const p = Math.floor(Math.random() * 999999);
  const params = {
    p,
    sig,
    type: 'any',
    token: encodeURIComponent(token),
    player: 'twitchweb',
    allow_source: true,
    allow_audio_only: true,
    allow_spectre: false,
    fast_bread: true,
    playlist_include_framerate: true,
    reassignments_supported: true,
  };
  const urlParams = Object.entries(params).map((param) => param.join('=')).join('&');

  return `https://usher.ttvnw.net/api/channel/hls/${channel}.m3u8?${urlParams}`;
}

/**
 * Get access token from loaded url.
 * Used to receive stream playlist
 */
async function getAcessToken (channel: string, headers: {[key: string]: string}): Promise<any> {
  return await new Promise((resolve, reject) => {
    const playerType = 'site'; // picture-by-picture
    const url = `https://api.twitch.tv/api/channels/${channel}/access_token?oauth_token=&platform=_&player_backend=mediaplayer&player_type=${playerType}`;

    const get = request.get(url, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        'client-id': env.STREAM_CLIENT_ID,
        ...headers,
      },
    });

    get.onload = (data: AccessTokenResponse) => {
      resolve(data);
    };

    get.onerror = (error) => {
      reject(new Error(error));
    };
  });
}

/**
 * Returns playlist url
 */
export async function getStream (channel: string, headers: Record<string, string>): Promise<string> {
  return await new Promise((resolve, reject) => {
    getAcessToken(channel, headers)
      .then(({ sig, token }) => {
        const playlistUrl = formPlaylistUrl({ channel, sig, token });

        resolve(playlistUrl);
      })
      .catch(reject);
  });
}

/**
 * Parse video fragment tags
 */
export function parseFragTags (tagList: string[][]): Array<Record<string, any>> {
  const filteredTags = tagList.reduce((result: Array<Record<string, string[]>>, item) => {
    const tagName = item.shift();

    if (tagName) {
      result.push({
        [tagName]: item,
      });
    }

    return result;
  }, []);

  const filteredProps = filteredTags.reduce((result: Array<Record<string, any>>, item) => {
    Object.entries(item).forEach(([tagName, rawProps]) => {
      /**
       * Do not bother if we have nothing to parse
       */
      if (rawProps.length !== 1 || rawProps.every((rawProp) => !rawProp.includes(','))) {
        result.push({
          [tagName]: rawProps,
        });

        return;
      }

      const parsedProps = rawProps[0].split(',').reduce((resultProps: Record<string, string>, rawPair) => {
        const [name, value] = rawPair.split('=');

        resultProps[name] = value.replace(/"/g, '');

        return resultProps;
      }, {});

      result.push({
        [tagName]: parsedProps,
      });
    });

    return result;
  }, []);

  return filteredProps;
}
