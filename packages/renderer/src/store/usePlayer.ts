import { createSharedComposable } from '@vueuse/core';
import { AccessTokenResponse, PlayerLayout } from '@/types/renderer/player';
import { useUser } from './useUser';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { uid } from '../utils/utils';
import { useStore } from './__useStore';
import { PlayerStoreName, defaultPlayerState } from '@/store/player';

enum PlayerEndpoint {
  GraphApi = 'https://gql.twitch.tv/gql',
  Stats = 'https://spade.twitch.tv/track',
}

interface PlaylistAccess {
  sig: string;
  token: string;
}

const DEVICE_ID = uid();

function formPlaylistUrl (channel: string, { sig, token }: PlaylistAccess): string {
  const params = {
    sig,
    type: 'any',
    p: Math.floor(Math.random() * 999999),
    token: encodeURIComponent(token),
    player: 'twitchweb',
    allow_source: true,
    allow_audio_only: true,
    allow_spectre: false,
    fast_bread: true,
    playlist_include_framerate: true,
    reassignments_supported: true,
  };

  const query = Object.entries(params).map((param) => param.join('=')).join('&');

  return `https://usher.ttvnw.net/api/channel/hls/${channel}.m3u8?${query}`;
}

export const usePlayer = createSharedComposable(() => {
  const { state } = useStore(PlayerStoreName, defaultPlayerState);

  const { state: userState } = useUser();
  const { post } = useRequest();

  async function getAcessToken (channel: string): Promise<PlaylistAccess> {
    const response = await post<AccessTokenResponse>(PlayerEndpoint.GraphApi, {
      operationName: 'PlaybackAccessToken_Template',
      query: 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
      variables: {
        isLive: true,
        login: channel,
        isVod: false,
        vodID: '',
        playerType: 'site',
      },
    }, {
      'Client-ID': import.meta.env.VITE_STREAM_CLIENT_ID,
      'Device-ID': DEVICE_ID,
    });

    return {
      sig: response.data.streamPlaybackAccessToken.signature,
      token: response.data.streamPlaybackAccessToken.value,
    };
  }

  async function getPlaylist (channel: string): Promise<string> {
    const access = await getAcessToken(channel);

    return formPlaylistUrl(channel, access);
  }

  async function sendStats ({ broadcastId, channeld }: { broadcastId: string; channeld: string }): Promise<void> {
    const data = [
      {
        event: 'minute-watched',
        properties: {
          broadcast_id: broadcastId,
          channel_id: channeld,
          login: userState.name,
          platform: 'web',
          player: 'site',
        },
      },
    ];

    await post(PlayerEndpoint.Stats, {
      data: btoa(JSON.stringify(data)),
    });
  }

  function toggleSidebar (): void {
    state.isHideSidebar = state.isHideSidebar === false;
  }

  function toggleChat (): void {
    state.isHideChat = state.isHideChat === false;
  }

  function toggleLayout (): void {
    const value = state.layout === PlayerLayout.Horizontal ? PlayerLayout.Vertical : PlayerLayout.Horizontal;

    state.layout = value;
  }

  function setVolume (value: number): void {
    state.volume = value;
  }

  function setCompressor (value: boolean): void {
    state.compressor = value;
  }

  return {
    state,
    getPlaylist,
    toggleSidebar,
    toggleChat,
    toggleLayout,
    setVolume,
    setCompressor,
    sendStats,
  };
});
