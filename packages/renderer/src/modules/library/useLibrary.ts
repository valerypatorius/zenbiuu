import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { type LibraryStoreSchema, type TwitchResponse, type TwitchStream, type TwitchUserFollow, type TwitchUser, type TwitchChannelFromSearch, Sorting } from './types';
import { useUser } from '@/src/modules/auth/useUser';
import date from '@/src/utils/date';
import { getCurrentUnixTime } from '@/src/utils/utils';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { useInterval } from '@/src/infrastructure/interval/useInterval';
import { useStore } from '@/src/infrastructure/store/useStore';

enum LibraryError {
  EmptySearchResult = 'Nothing found',
};

enum LibraryEndpoint {
  Follows = 'https://api.twitch.tv/helix/users/follows',
  Streams = 'https://api.twitch.tv/helix/streams',
  Users = 'https://api.twitch.tv/helix/users',
  SearchChannels = 'https://api.twitch.tv/helix/search/channels',
}

/**
 * Library reload interval in ms
 */
const RELOAD_INTERVAL = 2 * date.Minute;

export const defaultLibraryState: LibraryStoreSchema = {
  sorting: Sorting.ViewersDesc,
};

export const useLibrary = createSharedComposable(() => {
  const { state } = useStore('library', defaultLibraryState);
  const { state: userState } = useUser();
  const { get } = useRequest();
  const { start: startInterval } = useInterval();

  const isReady = ref(false);

  const lastUpdateTime = useIDBKeyval<number>('library:lastUpdateTime', 0);

  const followedIds = useIDBKeyval<string[]>('library:followedIds', []);
  const followedChannels = useIDBKeyval<TwitchUser[]>('library:followedChannels', []);
  const followedStreams = useIDBKeyval<TwitchStream[]>('library:followedStreams', []);
  const foundStreams = useIDBKeyval<TwitchStream[]>('library:foundStreams', []);

  /**
   * Request followed channels list
   */
  async function getFollowedChannels (): Promise<void> {
    const { data } = await get<TwitchResponse<TwitchUserFollow>>(`${LibraryEndpoint.Follows}?from_id=${userState.id}&first=100`);

    followedIds.value = data.map((user) => user.to_id);
  }

  /**
   * Request data of followed channels
   */
  async function getFollowedChannelsData (): Promise<void> {
    const query = followedIds.value.join('&id=');
    const { data } = await get<TwitchResponse<TwitchUser>>(`${LibraryEndpoint.Users}?id=${query}`);

    followedChannels.value = data;
  }

  /**
   * Request streams data of followed channels ids
   */
  async function getFollowedStreams (): Promise<void> {
    const query = followedIds.value.join('&user_id=');
    const { data } = await get<TwitchResponse<TwitchStream>>(`${LibraryEndpoint.Streams}?user_id=${query}&first=100`);

    followedStreams.value = data;
    lastUpdateTime.value = getCurrentUnixTime();

    isReady.value = true;
  }

  /**
   * Request streams data of found channels ids
   */
  async function getFoundStreams (ids: string[]): Promise<void> {
    const query = ids.join('&user_id=');
    const { data } = await get<TwitchResponse<TwitchStream>>(`${LibraryEndpoint.Streams}?user_id=${query}&first=100`);

    foundStreams.value = data;
  }

  /**
   * Search streams by specified query
   */
  async function search (query: string): Promise<TwitchChannelFromSearch[]> {
    const { data } = await get<TwitchResponse<TwitchChannelFromSearch>>(`${LibraryEndpoint.SearchChannels}?query=${query}&first=10`);
    const liveIds = data.filter((item) => item.is_live).map((item) => item.id);

    if (liveIds.length === 0) {
      return await Promise.reject(LibraryError.EmptySearchResult);
    }

    await getFoundStreams(liveIds);

    return await Promise.resolve(data);
  }

  /**
   * Update library state by requesting all data for it
   */
  async function update (): Promise<void> {
    await getFollowedChannels();

    void getFollowedChannelsData();

    startInterval(() => {
      void getFollowedStreams();
    }, RELOAD_INTERVAL, {
      immediate: true,
    });
  }

  /**
   * Reset library state
   */
  function reset (): void {
    isReady.value = false;

    lastUpdateTime.value = 0;
    followedIds.value = [];
    followedChannels.value = [];
    followedStreams.value = [];
    foundStreams.value = [];
  }

  return {
    state,
    update,
    reset,
    search,
    isReady,
    followedIds,
    followedChannels,
    followedStreams,
    foundStreams,
    lastUpdateTime,
  };
});
