import { ref } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { config, getStringByteLength } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';
import { PlayerLayout } from '@/types/renderer/player';
import { getPlaylist } from '@/src/utils/m3u8';
import { useUserState } from './useUserState';
import request from '@/src/utils/request';

enum PlayerEndpoint {
  Stats = 'https://spade.twitch.tv/track',
}

export const usePlayerState = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.Player]>({
    volume: 0.25,
    compressor: false,
    isHideSidebar: false,
    isHideChat: false,
    layout: PlayerLayout.Horizontal,
  });

  const state = toReactive(refState);

  const { state: userState } = useUserState();

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.Player);

    // watch(state, () => {
    //   config.set(Module.Player, state);
    // });
  }

  async function getStream (channelName: string): Promise<string> {
    const headers = {
      Authorization: `OAuth ${userState.token}`,
    };

    const url = await getPlaylist(channelName, headers);

    return url;
  }

  function toggleSidebar (): void {
    state.isHideSidebar = !state.isHideSidebar;
  }

  function toggleChat (): void {
    state.isHideChat = !state.isHideChat;
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

  function sendStats ({ broadcastId, channeld }: { broadcastId: string; channeld: string }): void {
    if (!userState.token) {
      return;
    }

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

    const body = `data=${btoa(JSON.stringify(data))}`;

    request.post(PlayerEndpoint.Stats, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': getStringByteLength(body),
      },
    }, body);
  }

  async function getInfo (): Promise<void> {

  }

  return {
    state,
    getStream,
    toggleSidebar,
    toggleChat,
    toggleLayout,
    setVolume,
    setCompressor,
    sendStats,
  };
});
