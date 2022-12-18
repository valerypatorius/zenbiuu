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

    // acmb: 'e30=',
    // player_version: '1.16.0',
    // player_backend: 'mediaplayer',
    // cdm: 'wv',
  };
  const urlParams = Object.entries(params).map((param) => param.join('=')).join('&');

  return `https://usher.ttvnw.net/api/channel/hls/${channel}.m3u8?${urlParams}`;
}

/**
 * Get access token from loaded url.
 * Used to receive stream playlist
 */
async function getAcessToken (channel: string, headers: Record<string, any>): Promise<{ sig: string; token: string }> {
  return await new Promise((resolve, reject) => {
    const url = 'https://gql.twitch.tv/gql';

    // const test = request.post('https://gql.twitch.tv/integrity', {
    //   headers: {
    //     'Client-ID': env.STREAM_CLIENT_ID,
    //   },
    // }, '');

    // test.onload = (r) => {
    //   console.log('???', r);
    // };

    const post = request.post(url, {
      headers: {
        // Accept: '*/*',
        // Authorization: `OAuth stl33hm73o7ov5km58lwzekh30kknf`,
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US',
        Authorization: undefined,
        'Client-ID': env.STREAM_CLIENT_ID,
        Host: 'gql.twitch.tv',
        Origin: 'https://player.twitch.tv',
        Referer: 'https://player.twitch.tv/',
        // 'Client-Integrity': '',
        // 'Client-Session-Id': '',
        // Host: 'gql.twitch.tv',
        // Origin: 'https://www.twitch.tv',
        // Referer: 'https://www.twitch.tv/',
      },
    }, JSON.stringify({
      operationName: 'PlaybackAccessToken_Template',
      query: 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
      variables: {
        isLive: true,
        login: channel,
        isVod: false,
        vodID: '',
        playerType: 'site',
      },
    }));

    post.onload = (response: AccessTokenResponse) => {
      const { value: token, signature: sig } = response.data.streamPlaybackAccessToken;

      const tokenObj = JSON.parse(token);

      // tokenObj.hide_ads = true;
      // tokenObj.server_ads = false;
      // tokenObj.show_ads = false;
      // tokenObj.turbo = true;

      resolve({
        sig,
        token: JSON.stringify(tokenObj),
      });
    };

    post.onerror = (error) => {
      reject(new Error(error));
    };
  });
}

/**
 * Returns playlist url
 */
export async function getPlaylist (channel: string, headers: Record<string, string>): Promise<string> {
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
