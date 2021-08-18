import { ActionContext } from 'vuex';
import { config, getStringByteLength } from '@/src/utils/hub';
import { Module, RootState, ModuleState } from '@/types/schema';
import { getStream } from '@/src/utils/m3u8';
import request from '@/src/utils/request';
import { StreamType, TwitchResponse, TwitchStream } from '@/types/renderer/library';
import * as actionType from '../actions';
import * as endpoints from '../endpoints';
import { EMPTY_AUTH, EMPTY_STREAM_INFO } from '@/src/store/errors';
import { PlayerLayout } from '@/types/renderer/player';

type PlayerState = ModuleState<Module.Player>;

const defaultState = await config.get('player');

const actions = {
  /**
   * Set player volume.
   * Saved in config file
   */
  [actionType.SET_PLAYER_VOLUME] ({ state }: ActionContext<PlayerState, RootState>, value: number): void {
    state.volume = value;

    config.set('player.volume', value);
  },

  /**
   * Set audio compressor state for player.
   * Saved in config file
   */
  [actionType.SET_PLAYER_AUDIO_COMPRESSOR] ({ state }: ActionContext<PlayerState, RootState>, value: boolean): void {
    state.compressor = value;

    config.set('player.compressor', value);
  },

  /**
   * Toggle player layout.
   * Saved in config file
   */
  [actionType.TOGGLE_PLAYER_LAYOUT] ({ state }: ActionContext<PlayerState, RootState>): void {
    const value = state.layout === PlayerLayout.Horizontal ? PlayerLayout.Vertical : PlayerLayout.Horizontal;

    state.layout = value;

    config.set('player.layout', value);
  },

  /**
   * Request channel playlist
   */
  async [actionType.REQUEST_CHANNEL_PLAYLIST] (
    context: ActionContext<PlayerState, RootState>,
    { channel, headers = {} }: ({channel: string; headers: Record<string, string>}),
  ): Promise<string> {
    return await new Promise((resolve) => {
      getStream(channel.toLowerCase(), headers).then(resolve);
    });
  },

  /**
   * Fetch stream info
   */
  async [actionType.REQUEST_STREAM_INFO] (
    { rootState, dispatch }: ActionContext<PlayerState, RootState>,
    { channel, streamType }: { channel: string; streamType: StreamType },
  ): Promise<void> {
    return await new Promise((resolve, reject) => {
      if (!rootState.user || !rootState.clientId) {
        reject(new Error(EMPTY_AUTH));

        return;
      }

      const get = request.get(`${endpoints.STREAMS}?user_login=${channel}`, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `Bearer ${rootState.user.token}`,
          'Client-ID': rootState.clientId,
        },
      });

      get.onload = (response: TwitchResponse<TwitchStream>) => {
        const { data } = response;
        const [info] = data;

        if (!info) {
          reject(new Error(EMPTY_STREAM_INFO));

          return;
        }

        dispatch(actionType.SET_STREAM_DATA, {
          data: info,
          streamType,
        });

        resolve();
      };
    });
  },

  /**
   * Send player stats to gain channel points
   */
  async [actionType.SEND_PLAYER_STATS] (
    { rootState }: ActionContext<PlayerState, RootState>,
    info: {id: string; user_id: string},
  ): Promise<void> {
    if (!rootState.user) {
      return;
    }

    const data = [
      {
        event: 'minute-watched',
        properties: {
          broadcast_id: info.id,
          channel_id: info.user_id,
          login: rootState.user.name,
          platform: 'web',
          player: 'site',
        },
      },
    ];

    const body = `data=${btoa(JSON.stringify(data))}`;

    request.post(endpoints.TRACK_STATS, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': getStringByteLength(body),
      },
    }, body);
  },

  /**
   * Toggle sidebar visibility on player screen.
   * Saved in config file
   */
  [actionType.TOGGLE_PLAYER_SIDEBAR] ({ state }: ActionContext<PlayerState, RootState>): void {
    const value = !state.isHideSidebar;

    state.isHideSidebar = value;

    config.set('player.isHideSidebar', value);
  },

  /**
   * Toggle chat visibility on player screen.
   * Saved in config file
   */
  [actionType.TOGGLE_PLAYER_CHAT] ({ state }: ActionContext<PlayerState, RootState>): void {
    const value = !state.isHideChat;

    state.isHideChat = value;

    config.set('player.isHideChat', value);
  },
};

export default {
  state: defaultState,
  actions,
};
