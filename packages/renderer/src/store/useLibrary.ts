import { computed, watch, ref } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { useInterface } from './useInterface';
import { useUser, UserError } from './useUser';
import { config } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';
import { Sorting, TwitchResponse, TwitchStream, TwitchUserFollow, TwitchUser, TwitchChannelFromSearch, StreamType } from '@/types/renderer/library';
import request from '@/src/utils/request';
import date from '@/src/utils/date';
import interval from '@/src/utils/interval';
import { getCurrentUnixTime } from '@/src/utils/utils';
import type { IntervalManagerItem } from '../utils/interval';

enum LibraryError {
  EmptySearchQuery = 'Search query is empty',
  EmptySearchResult = 'Nothing found',
  Request = 'Request failed',
};

enum LibraryEndpoint {
  Follows = 'https://api.twitch.tv/helix/users/follows',
  Streams = 'https://api.twitch.tv/helix/streams',
  Users = 'https://api.twitch.tv/helix/users',
  SearchChannels = 'https://api.twitch.tv/helix/search/channels',
}

/** Library reload interval */
const RELOAD_INTERVAL = 2 * date.Minute;

export const useLibrary = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.Library]>({
    sorting: Sorting.ViewersDesc,
    followed: [],
    streams: {
      followed: [],
      found: [],
    },
    users: [],
    lastUpdateTime: 0,
    isReady: false,
  });

  const state = toReactive(refState);

  const { state: interfaceState } = useInterface();
  const { state: userState } = useUser();

  const followedIds = computed(() => state.followed.map((user) => user.to_id));

  /** Reload interval for channels in library */
  const reloadInterval = ref<IntervalManagerItem>();

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.Library);

    // watch(state, () => {
    //   config.set(Module.Library, state);
    // });
  }

  /**
   * Request followed channels list
   */
  async function getFollowedChannels (): Promise<void> {
    if (!userState.token) {
      return await Promise.reject(new Error(UserError.MissingAuthToken));
    }

    interfaceState.isLoading = true;

    return await new Promise((resolve, reject) => {
      const get = request.get(`${LibraryEndpoint.Follows}?from_id=${userState.id}&first=100`, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `Bearer ${userState.token}`,
          'Client-ID': import.meta.env.VITE_APP_CLIENT_ID,
        },
      });

      get.onload = (response: TwitchResponse<TwitchUserFollow>) => {
        state.followed = response.data;
        interfaceState.isLoading = false;

        resolve();
      };

      get.onerror = (error) => {
        interfaceState.isLoading = false;

        reject(error);
      };
    });
  }

  /**
   * Request data of followed channels
   */
  async function getFollowedChannelsData (): Promise<void> {
    if (!userState.token) {
      return await Promise.reject(new Error(UserError.MissingAuthToken));
    }

    interfaceState.isLoading = true;

    return await new Promise((resolve, reject) => {
      const query = followedIds.value.join('&id=');

      const get = request.get(`${LibraryEndpoint.Users}?id=${query}`, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `Bearer ${userState.token}`,
          'Client-ID': import.meta.env.VITE_APP_CLIENT_ID,
        },
      });

      get.onload = (response: TwitchResponse<TwitchUser>) => {
        state.users = response.data;
        interfaceState.isLoading = false;

        resolve();
      };

      get.onerror = (error) => {
        interfaceState.isLoading = false;

        reject(error);
      };
    });
  }

  /**
   * Request streams from followed ids
   */
  async function getStreams (ids: string[], type = StreamType.Followed): Promise<void> {
    if (!userState.token) {
      return await Promise.reject(new Error(UserError.MissingAuthToken));
    }

    interfaceState.isLoading = true;

    return await new Promise((resolve, reject) => {
      const query = ids.join('&user_id=');

      const get = request.get(`${LibraryEndpoint.Streams}?user_id=${query}&first=100`, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `Bearer ${userState.token}`,
          'Client-ID': import.meta.env.VITE_APP_CLIENT_ID,
        },
      });

      get.onload = (response: TwitchResponse<TwitchStream>) => {
        if (response.data) {
          state.streams[type] = response.data;
          state.lastUpdateTime = getCurrentUnixTime();
          state.isReady = true;
        }

        interfaceState.isLoading = false;

        resolve();
      };

      get.onerror = (error) => {
        interfaceState.isLoading = false;

        reject(error);
      };
    });
  }

  async function update (): Promise<void> {
    await getFollowedChannels();

    getFollowedChannelsData();

    if (!reloadInterval.value) {
      reloadInterval.value = interval.start(RELOAD_INTERVAL);
      reloadInterval.value.onupdate = () => {
        getStreams(followedIds.value);
      };
    }
  }

  function reset (): void {
    state.followed = [];

    state.streams = {
      followed: [],
      found: [],
    };

    state.users = [];
    state.lastUpdateTime = 0;
    state.isReady = false;
  }

  async function search (query: string): Promise<TwitchChannelFromSearch[]> {
    if (!userState.token) {
      return await Promise.reject(new Error(UserError.MissingAuthToken));
    }

    if (!query) {
      return await Promise.reject(new Error(LibraryError.EmptySearchQuery));
    }

    interfaceState.isLoading = true;

    return await new Promise((resolve, reject) => {
      const headers = {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `Bearer ${userState.token}`,
        'Client-ID': import.meta.env.VITE_APP_CLIENT_ID,
      };

      const get = request.get(`${LibraryEndpoint.SearchChannels}?query=${query}&first=10`, {
        headers,
      });

      get.onload = async (searchData: TwitchResponse<TwitchChannelFromSearch>) => {
        const liveIds = searchData.data
          .filter((item) => item.is_live)
          .map((item) => item.id);

        if (!liveIds.length) {
          interfaceState.isLoading = false;

          reject(new Error(LibraryError.EmptySearchResult));

          return;
        }

        await getStreams(liveIds, StreamType.Found);

        console.log(state);

        interfaceState.isLoading = false;

        resolve(searchData.data);
      };

      get.onerror = (error) => {
        interfaceState.isLoading = false;

        reject(error);
      };
    });
  }

  return {
    state,
    update,
    reset,
    search,
  };
});
