import { type TwitchPlaylistAccessTokenResponse } from '../types';

export function composeStreamPlaylistUrl (channelName: string, { data }: TwitchPlaylistAccessTokenResponse): string {
  const params = {
    sig: data.streamPlaybackAccessToken.signature,
    type: 'any',
    p: Math.floor(Math.random() * 999999),
    token: encodeURIComponent(data.streamPlaybackAccessToken.value),
    player: 'twitchweb',
    allow_source: true,
    allow_audio_only: true,
    allow_spectre: false,
    fast_bread: true,
    playlist_include_framerate: true,
    reassignments_supported: true,
  };

  const query = Object.entries(params).map((param) => param.join('=')).join('&');

  return `https://usher.ttvnw.net/api/channel/hls/${channelName.toLowerCase()}.m3u8?${query}`;
}
