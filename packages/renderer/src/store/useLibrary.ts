import { computed, ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useUser } from './useUser';
import { TwitchResponse, TwitchStream, TwitchUserFollow, TwitchUser, TwitchChannelFromSearch, StreamType } from '@/types/renderer/library';
import date from '@/src/utils/date';
import { getCurrentUnixTime } from '@/src/utils/utils';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { useInterval } from '@/src/infrastructure/interval/useInterval';
import { useStore } from './__useStore';
import { LibraryStoreName, defaultLibraryState } from '@/store/library';

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

export const useLibrary = createSharedComposable(() => {
  const { state } = useStore(LibraryStoreName, defaultLibraryState);
  const { state: userState } = useUser();
  const { get } = useRequest();
  const { start: startInterval } = useInterval();

  const isReady = ref(false);

  const followedIds = computed(() => state.followed.map((user) => user.to_id));

  /**
   * Request followed channels list
   */
  async function getFollowedChannels (): Promise<void> {
    const { data } = await get<TwitchResponse<TwitchUserFollow>>(`${LibraryEndpoint.Follows}?from_id=${userState.id}&first=100`);

    state.followed = data;
  }

  /**
   * Request data of followed channels
   */
  async function getFollowedChannelsData (): Promise<void> {
    const query = followedIds.value.join('&id=');
    const { data } = await get<TwitchResponse<TwitchUser>>(`${LibraryEndpoint.Users}?id=${query}`);

    state.users = data;
  }

  /**
   * Request streams from followed ids
   */
  async function getStreams (ids: string[], type = StreamType.Followed): Promise<void> {
    const query = ids.join('&user_id=');
    const { data } = await get<TwitchResponse<TwitchStream>>(`${LibraryEndpoint.Streams}?user_id=${query}&first=100`);

    state.streams[type] = data;
    state.lastUpdateTime = getCurrentUnixTime();

    isReady.value = true;
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

    await getStreams(liveIds, StreamType.Found);

    return await Promise.resolve(data);
  }

  /**
   * Update library state by requesting all data for it
   */
  async function update (): Promise<void> {
    await getFollowedChannels();

    void getFollowedChannelsData();

    startInterval(() => {
      void getStreams(followedIds.value);
    }, RELOAD_INTERVAL, {
      immediate: true,
    });
  }

  /**
   * Reset library state
   */
  function reset (): void {
    isReady.value = false;

    state.lastUpdateTime = 0;
    state.followed = [];
    state.users = [];
    state.streams = {
      followed: [],
      found: [],
    };
  }

  return {
    state,
    update,
    reset,
    search,
    isReady,
  };
});
