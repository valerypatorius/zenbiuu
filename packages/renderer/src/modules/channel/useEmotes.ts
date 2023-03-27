import { createSharedComposable } from '@vueuse/core';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { computed } from 'vue';
import { parseTwitchEmotes, parseBTTVEmotes, parseFFZEmotes, parse7TVEmotes } from './utils/emotes';
import type { BttvChannelEmotes, BttvGlobalEmotes, FfzChannelEmotes, SevenTvEmotes, ChatEmote, TwitchEmotesResponse } from './types/chat';
import { useRequest } from '@/src/infrastructure/request/useRequest';

enum EmotesEndpoint {
  TwitchGlobal = 'https://api.twitch.tv/helix/chat/emotes/global',
  TwitchChannel = 'https://api.twitch.tv/helix/chat/emotes',
  BttvGlobal = 'https://api.betterttv.net/3/cached/emotes/global',
  BttvChannel = 'https://api.betterttv.net/3/cached/users/twitch',
  FfzChannel = 'https://api.frankerfacez.com/v1/room',
  SevenTvGlobal = 'https://api.7tv.app/v2/emotes/global',
  SevenTvChannel = 'https://api.7tv.app/v2/users',
}

export const useEmotes = createSharedComposable(() => {
  const { get } = useRequest();

  const globalEmotes = useIDBKeyval<Record<string, ChatEmote>>('emotes:global', {}, {
    shallow: true,
  });

  const channelEmotes = useIDBKeyval<Record<string, ChatEmote>>('emotes:channel', {}, {
    shallow: true,
  });

  const emotes = computed(() => {
    return {
      ...globalEmotes.value,
      ...channelEmotes.value,
    };
  });

  async function getTwitchGlobalEmotes (): Promise<Record<string, ChatEmote>> {
    const response = await get<TwitchEmotesResponse>(EmotesEndpoint.TwitchGlobal);

    return parseTwitchEmotes(response);
  }

  async function getTwitchChannelEmotes (channelId: string): Promise<Record<string, ChatEmote>> {
    const response = await get<TwitchEmotesResponse>(`${EmotesEndpoint.TwitchChannel}/?broadcaster_id=${channelId}`);

    return parseTwitchEmotes(response);
  }

  async function getBttvGlobalEmotes (): Promise<Record<string, ChatEmote>> {
    const response = await get<BttvGlobalEmotes>(EmotesEndpoint.BttvGlobal, { headers: undefined });

    return parseBTTVEmotes(response);
  }

  async function getBttvChannelEmotes (channelId: string): Promise<Record<string, ChatEmote>> {
    const response = await get<BttvChannelEmotes>(`${EmotesEndpoint.BttvChannel}/${channelId}`, { headers: undefined });
    const { channelEmotes, sharedEmotes } = response;

    return parseBTTVEmotes([
      ...channelEmotes,
      ...sharedEmotes,
    ]);
  }

  async function getFfzChannelEmotes (channelName: string): Promise<Record<string, ChatEmote>> {
    const response = await get<FfzChannelEmotes>(`${EmotesEndpoint.FfzChannel}/${channelName}`, { headers: undefined });

    return Object.values(response.sets).reduce((result, set) => {
      result = {
        ...result,
        ...parseFFZEmotes(set.emoticons),
      };

      return result;
    }, {});
  }

  async function getSevenTvGlobalEmotes (): Promise<Record<string, ChatEmote>> {
    const response = await get<SevenTvEmotes>(EmotesEndpoint.SevenTvGlobal, { headers: undefined });

    return parse7TVEmotes(response);
  }

  async function getSevenTvChannelEmotes (channelName: string): Promise<Record<string, ChatEmote>> {
    const response = await get<SevenTvEmotes>(`${EmotesEndpoint.SevenTvChannel}/${channelName}/emotes`, { headers: undefined });

    return parse7TVEmotes(response);
  }

  function addGlobalEmotes (list: Record<string, ChatEmote>): void {
    globalEmotes.value = {
      ...globalEmotes.value,
      ...list,
    };
  }

  function addChannelEmotes (list: Record<string, ChatEmote>): void {
    channelEmotes.value = {
      ...channelEmotes.value,
      ...list,
    };
  }

  function clearChannelEmotes (): void {
    channelEmotes.value = {};
  }

  async function getGlobalEmotes (): Promise<void> {
    void getTwitchGlobalEmotes().then(addGlobalEmotes);
    void getBttvGlobalEmotes().then(addGlobalEmotes);
    void getSevenTvGlobalEmotes().then(addGlobalEmotes);
  }

  async function getChannelEmotes (channelName: string, channelId: string): Promise<void> {
    clearChannelEmotes();

    void getTwitchChannelEmotes(channelId).then(addChannelEmotes);
    void getBttvChannelEmotes(channelId).then(addChannelEmotes);
    void getFfzChannelEmotes(channelName).then(addChannelEmotes);
    void getSevenTvChannelEmotes(channelName).then(addChannelEmotes);
  }

  return {
    emotes,
    getGlobalEmotes,
    getChannelEmotes,
  };
});
