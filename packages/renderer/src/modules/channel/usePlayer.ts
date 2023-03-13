import { createSharedComposable } from '@vueuse/core';
import { type AccessTokenResponse, PlayerLayout, type PlayerStoreSchema } from './types/player';
import { useUser } from '@/src/modules/auth/useUser';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { useStore } from '@/src/infrastructure/store/useStore';
import { useHub } from '@/src/infrastructure/hub/useHub';

enum PlayerEndpoint {
  GraphApi = 'https://gql.twitch.tv/gql',
}

interface PlaylistAccess {
  sig: string;
  token: string;
}

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

const defaultPlayerState: PlayerStoreSchema = {
  volume: 0.25,
  compressor: false,
  isHideSidebar: false,
  isHideChat: false,
  layout: PlayerLayout.Horizontal,
  cover: undefined,
};

export const usePlayer = createSharedComposable(() => {
  const { state } = useStore('player', defaultPlayerState);

  const { state: userState } = useUser();
  const { post } = useRequest();
  const { state: hubState } = useHub();

  async function getAcessToken (channelName: string): Promise<PlaylistAccess> {
    const response = await post<AccessTokenResponse>(PlayerEndpoint.GraphApi, {
      operationName: 'PlaybackAccessToken_Template',
      query: 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
      variables: {
        isLive: true,
        login: channelName,
        isVod: false,
        vodID: '',
        playerType: 'site',
      },
    }, {
      headers: {
        'Client-ID': hubState.streamClientId,
        'Device-ID': userState.deviceId,
      },
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
  };
});
