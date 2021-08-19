import { ActionContext } from 'vuex';
import { library } from '@/src/utils/hub';
import { Module, RootState, ModuleState, schema } from '@/types/schema';
import request from '@/src/utils/request';
import { StreamType } from '@/types/renderer/library';
import type {
  TwitchResponse,
  TwitchStream,
  TwitchUser,
  TwitchUserFollow,
  TwitchChannelFromSearch,
  Sorting,
} from '@/types/renderer/library';
import { getCurrentUnixTime } from '@/src/utils/utils';
import * as endpoints from '../endpoints';
import * as actionType from '../actions';
import * as getterType from '../getters';
import { EMPTY_AUTH, EMPTY_SEARCH_QUERY, EMPTY_SEARCH_RESULT } from '@/src/store/errors';

type LibraryState = ModuleState<Module.Library>;

/**
 * Get list of streams data, based on channels ids
 */
const getStreams = async (
  ids: string[],
  headers: Record<string, string>,
): Promise<TwitchResponse<TwitchStream>> => await new Promise((resolve, reject) => {
  const query = ids.join('&user_id=');
  const get = request.get(`${endpoints.STREAMS}?user_id=${query}&first=100`, {
    headers,
  });

  get.onload = resolve;
  get.onerror = reject;
});

const defaultState = await library.get();

const moduleGetters = {
  /**
   * Returns list of followed channels ids
   */
  [getterType.FOLLOWED_IDS] (state: LibraryState): string[] {
    return state.followed.map((user) => user.to_id);
  },
};

const actions = {
  /**
   * Set followed channels list.
   * Saved in library file
   */
  [actionType.SET_FOLLOWED] ({ state }: ActionContext<LibraryState, RootState>, list: TwitchUserFollow[]): void {
    state.followed = list;

    library.set('followed', list);
  },

  /**
   * Set users data list.
   * Saved in library file
   */
  [actionType.SET_USERS] ({ state }: ActionContext<LibraryState, RootState>, list: TwitchUser[]): void {
    state.users = list;

    library.set('users', list);
  },

  /**
   * Set data for single stream.
   * Existing data is updated, new data is pushed to the list.
   * Saved in library file
   */
  [actionType.SET_STREAM_DATA] (
    { state }: ActionContext<LibraryState, RootState>,
    { data, streamType }: { data: TwitchStream; streamType: StreamType },
  ): void {
    const now = getCurrentUnixTime();
    /**
     * We need to copy streams data before saving it in file
     */
    const currentList = state.streams[streamType].map((stream) => JSON.parse(JSON.stringify(stream)) as TwitchStream);
    const streamIndex = currentList.findIndex((stream) => stream.user_login === data.user_login);

    if (streamIndex < 0) {
      currentList.push(data);
    } else {
      currentList[streamIndex] = data;
    }

    state.streams[streamType] = currentList;
    state.lastUpdateTime = now;

    library.set(`streams.${streamType}`, currentList);
    library.set('lastUpdateTime', now);
  },

  /**
   * Set streams data list.
   * Saved in library file
   */
  [actionType.SET_STREAMS] (
    { state }: ActionContext<LibraryState, RootState>,
    { list, streamType }: { list: TwitchStream[]; streamType: StreamType },
  ): void {
    const now = getCurrentUnixTime();

    state.streams[streamType] = list;
    state.lastUpdateTime = now;

    library.set(`streams.${streamType}`, list);
    library.set('lastUpdateTime', now);

    state.isReady = true;
  },

  /**
   * Fetch list of channels, followed by current user
   */
  [actionType.GET_USER_FOLLOWS] ({ rootState, dispatch }: ActionContext<LibraryState, RootState>): void {
    if (!rootState.user || !rootState.user.token) {
      return;
    }

    dispatch(actionType.SET_APP_LOADING, true);

    const get = request.get(`${endpoints.USERS_FOLLOWS}?from_id=${rootState.user.id}&first=100`, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `Bearer ${rootState.user.token}`,
        'Client-ID': rootState.clientId,
      },
    });

    get.onload = (response: TwitchResponse<TwitchUserFollow>) => {
      dispatch(actionType.SET_FOLLOWED, response.data);
      dispatch(actionType.SET_APP_LOADING, false);
    };

    get.onerror = () => {
      dispatch(actionType.SET_APP_LOADING, false);
    };
  },

  /**
   * Fetch list of active streams from followed ids
   */
  [actionType.GET_STREAMS] ({
    state, getters, rootState, dispatch,
  }: ActionContext<LibraryState, RootState>): void {
    if (!rootState.user || !rootState.user.token || !rootState.clientId || state.followed.length === 0) {
      return;
    }

    dispatch(actionType.SET_APP_LOADING, true);

    const headers = {
      Accept: 'application/vnd.twitchtv.v5+json',
      Authorization: `Bearer ${rootState.user.token}`,
      'Client-ID': rootState.clientId,
    };

    getStreams(getters.FOLLOWED_IDS, headers)
      .then((response: TwitchResponse<TwitchStream>) => {
        if (response.data) {
          dispatch(actionType.SET_STREAMS, {
            list: response.data,
            streamType: StreamType.Followed,
          });
        }
      })
      .finally(() => {
        dispatch(actionType.SET_APP_LOADING, false);
      });
  },

  /**
   * Fetch list of users data from followed ids
   */
  [actionType.GET_USERS] ({
    state, getters, rootState, dispatch,
  }: ActionContext<LibraryState, RootState>): void {
    if (!rootState.user || !rootState.user.token || !rootState.clientId || state.followed.length === 0) {
      return;
    }

    dispatch(actionType.SET_APP_LOADING, true);

    const query = getters.FOLLOWED_IDS.join('&id=');

    const get = request.get(`${endpoints.USERS}?id=${query}`, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `Bearer ${rootState.user.token}`,
        'Client-ID': rootState.clientId,
      },
    });

    get.onload = (response: TwitchResponse<TwitchUser>) => {
      dispatch(actionType.SET_USERS, response.data);
      dispatch(actionType.SET_APP_LOADING, false);
    };

    get.onerror = () => {
      dispatch(actionType.SET_APP_LOADING, false);
    };
  },

  /**
   * Search channels by query string
   */
  async [actionType.SEARCH_CHANNELS] (
    { rootState, dispatch }: ActionContext<LibraryState, RootState>, query: string,
  ): Promise<TwitchChannelFromSearch[]> {
    return await new Promise((resolve, reject) => {
      if (!rootState.user || !rootState.user.token || !rootState.clientId) {
        reject(new Error(EMPTY_AUTH));

        return;
      }

      if (!query) {
        reject(new Error(EMPTY_SEARCH_QUERY));

        return;
      }

      dispatch(actionType.SET_APP_LOADING, true);

      const headers = {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `Bearer ${rootState.user.token}`,
        'Client-ID': rootState.clientId,
      };

      const get = request.get(`${endpoints.SEARCH_CHANNELS}?query=${query}&first=10`, {
        headers,
      });

      get.onload = (searchData: TwitchResponse<TwitchChannelFromSearch>) => {
        const liveIds = searchData.data
          .filter((item) => item.is_live)
          .map((item) => item.id);

        if (!liveIds.length) {
          dispatch(actionType.SET_APP_LOADING, false);

          reject(new Error(EMPTY_SEARCH_RESULT));

          return;
        }

        getStreams(liveIds, headers)
          .then((streamsData: TwitchResponse<TwitchStream>) => {
            dispatch(actionType.SET_STREAMS, {
              list: streamsData.data,
              streamType: StreamType.Found,
            });

            resolve(searchData.data);
          })
          .catch()
          .finally(() => {
            dispatch(actionType.SET_APP_LOADING, false);
          });
      };

      get.onerror = (error) => {
        dispatch(actionType.SET_APP_LOADING, false);

        reject(new Error(error));
      };
    });
  },

  /**
   * Set library sorting.
   * Saved in library file
   */
  [actionType.SET_LIBRARY_SORTING] ({ state }: ActionContext<LibraryState, RootState>, value: Sorting): void {
    state.sorting = value;

    library.set('sorting', value);
  },

  /**
   * Reset library to initial values
   */
  [actionType.RESET_LIBRARY] ({ state }: ActionContext<LibraryState, RootState>) {
    Object.assign(state, schema[Module.Library]);

    library.clear();
  },
};

export default {
  state: defaultState,
  getters: moduleGetters,
  actions,
};
