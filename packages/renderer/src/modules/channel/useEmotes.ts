import { createSharedComposable } from '@vueuse/core';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { ref, computed } from 'vue';
import { parseTwitchEmotes, parseBTTVEmotes, parseFFZEmotes, parse7TVEmotes } from './utils/emotes';
import { type BttvChannelEmotes, type BttvGlobalEmotes, type FfzChannelEmotes, type SevenTvEmotes, type ChatEmote, type TwitchEmotesResponse } from './types/chat';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { sortArrayByFrequency, splitArrayIntoChunks } from '@/src/utils/utils';

enum EmotesEndpoint {
  TwitchGlobal = 'https://api.twitch.tv/helix/chat/emotes/global',
  TwitchChannel = 'https://api.twitch.tv/helix/chat/emotes',
  TwitchSets = 'https://api.twitch.tv/helix/chat/emotes/set',
  BttvGlobal = 'https://api.betterttv.net/3/cached/emotes/global',
  BttvChannel = 'https://api.betterttv.net/3/cached/users/twitch',
  FfzChannel = 'https://api.frankerfacez.com/v1/room',
  SevenTvGlobal = 'https://api.7tv.app/v2/emotes/global',
  SevenTvChannel = 'https://api.7tv.app/v2/users',
}

const RECENT_EMOTES_LIMIT = 50;

/**
 * @todo Deal with sub emotes from other channels
 */
export const useEmotes = createSharedComposable(() => {
  const { get } = useRequest();

  const globalEmotes = useIDBKeyval<Record<string, ChatEmote>>('emotes:global', {}, {
    shallow: true,
  });

  const channelEmotes = useIDBKeyval<Record<string, ChatEmote>>('emotes:channel', {}, {
    shallow: true,
  });

  const recentEmotes = useIDBKeyval<ChatEmote[]>('emotes:recent', [], {
    shallow: true,
  });

  const emotes = computed(() => {
    return {
      ...globalEmotes.value,
      ...channelEmotes.value,
    };
  });

  const hotEmotes = ref<ChatEmote[]>([]);

  const emotesByChar = computed(() => {
    const rawResult: Record<string, ChatEmote[]> = {};

    Object.entries(emotes.value).forEach(([name, emote]) => {
      const char = name.substring(0, 1);
      const isLetter = char.match(/[a-z]/i) !== null;
      const key = isLetter ? char.toUpperCase() : '123';

      if (rawResult[key] === undefined) {
        rawResult[key] = [];
      }

      rawResult[key].push(emote);
      rawResult[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return Object.keys(rawResult).sort().reduce<Record<string, ChatEmote[]>>((result, key) => {
      result[key] = rawResult[key];

      return result;
    }, {});
  });

  const isCommonEmotesRequested = ref(false);

  async function getTwitchChannelEmotes (channelId: string): Promise<Record<string, ChatEmote>> {
    const response = await get<TwitchEmotesResponse>(`${EmotesEndpoint.TwitchChannel}/?broadcaster_id=${channelId}`);

    return parseTwitchEmotes(response);
  }

  async function getTwitchEmoteSets (setsIds: string[]): Promise<Record<string, ChatEmote>> {
    const SETS_LIMIT = 25;
    const chunks = splitArrayIntoChunks(setsIds, SETS_LIMIT);
    const promises: Array<Promise<TwitchEmotesResponse>> = [];

    chunks.forEach((chunk) => {
      const query = chunk.map((id) => `emote_set_id=${id}`);

      promises.push(get<TwitchEmotesResponse>(`${EmotesEndpoint.TwitchSets}/?${query.join('&')}`));
    });

    const responses = await Promise.all(promises);

    return responses.reduce<Record<string, ChatEmote>>((result, response) => {
      result = {
        ...result,
        ...parseTwitchEmotes(response),
      };

      return result;
    }, {});
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

  async function getSevenTvChannelEmotes (channelId: string): Promise<Record<string, ChatEmote>> {
    const response = await get<SevenTvEmotes>(`${EmotesEndpoint.SevenTvChannel}/${channelId}/emotes`, { headers: undefined });

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

  /**
   * Request common emotes: sets of current user and third-party global emotes.
   * Note: emotes are requested once
   */
  async function getCommonEmotes (emoteSets?: string[]): Promise<void> {
    if (isCommonEmotesRequested.value) {
      return;
    }

    isCommonEmotesRequested.value = true;

    void getBttvGlobalEmotes().then(addGlobalEmotes);
    void getSevenTvGlobalEmotes().then(addGlobalEmotes);

    if (emoteSets !== undefined && emoteSets.length > 0) {
      void getTwitchEmoteSets(emoteSets).then(addGlobalEmotes);
    }
  }

  /**
   * Clear previously set channel emotes and request new for specified channel
   */
  async function getChannelEmotes (channelName: string, channelId: string): Promise<void> {
    clearChannelEmotes();

    void getTwitchChannelEmotes(channelId).then(addChannelEmotes);
    void getBttvChannelEmotes(channelId).then(addChannelEmotes);
    void getFfzChannelEmotes(channelName).then(addChannelEmotes);
    void getSevenTvChannelEmotes(channelId).then(addChannelEmotes);
  }

  /**
   * Set hot emotes from provided emotes' names list
   */
  function setHotEmotes (names?: string[]): void {
    /**
     * If no emotes were provided, clear the list and do not proceed
     */
    if (names === undefined || names.length === 0) {
      hotEmotes.value = [];

      return;
    }

    /**
     * Sort provided list of emotes' names by frequency and map to emotes data
     */
    hotEmotes.value = sortArrayByFrequency(names).reduce<ChatEmote[]>((result, name) => {
      if (name in emotes.value) {
        result.push(emotes.value[name]);
      }

      return result;
    }, []);
  }

  /**
   * Add emote with specified name to recent emotes list
   */
  function addRecentEmote (name: string): void {
    /**
     * If emote is not recognized, do not proceed
     */
    if (!(name in emotes.value)) {
      return;
    }

    /**
     * Make copy of recent emotes list,
     * otherwise IDB value will not be updated via array methods
     */
    const curentRecentEmotes = [...recentEmotes.value];

    /**
     * Try to find index of an emote
     */
    const presentEmoteIndex = curentRecentEmotes.findIndex((emote) => emote.name === name);

    /**
     * If emote is present, remove it from the list
     */
    if (presentEmoteIndex > -1) {
      curentRecentEmotes.splice(presentEmoteIndex, 1);
    }

    /**
     * And add at the start
     */
    curentRecentEmotes.unshift(emotes.value[name]);

    /**
     * If new list length is too long, remove the last emote from it
     */
    if (curentRecentEmotes.length > RECENT_EMOTES_LIMIT) {
      curentRecentEmotes.pop();
    }

    /**
     * Finally, replace existing list with the modified one
     */
    recentEmotes.value = curentRecentEmotes;
  }

  return {
    emotes,
    emotesByChar,
    hotEmotes,
    recentEmotes,
    getCommonEmotes,
    getChannelEmotes,
    setHotEmotes,
    addRecentEmote,
  };
});
