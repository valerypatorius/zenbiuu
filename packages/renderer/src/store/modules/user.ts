import { ActionContext } from 'vuex';
import { Module, RootState, ModuleState } from '@/types/schema';
import { config, requestAccessToken } from '@/src/utils/hub';
import { getCurrentUnixTime } from '@/src/utils/utils';
import * as endpoints from '@/src/store/endpoints';
import irc from '@/src/utils/irc';
import request from '@/src/utils/request';
import log from '@/src/utils/log';
import date from '@/src/utils/date';
import * as actionType from '../actions';
import { EMPTY_AUTH } from '@/src/store/errors';
import { TwitchTokenValidationResponse } from '@/types/renderer/user';

type UserState = ModuleState<Module.User>;

/**
 * Max lifetime of auth token before validation is required
 */
const TOKEN_LIFETIME = date.Hour;

const defaultState = await config.get('user');

const actions = {
  /**
   * Set logined user access token.
   * Saved in config file
   */
  [actionType.SET_USER_ACCESS_TOKEN] ({ state }: ActionContext<UserState, RootState>, token: string): void {
    state.token = token;

    config.set('user.token', token);
  },

  /**
   * Set logined user id.
   * Saved in config file
   */
  [actionType.SET_USER_ID] ({ state }: ActionContext<UserState, RootState>, id: string): void {
    state.id = id;

    config.set('user.id', id);
  },

  /**
   * Set logined user name.
   * Saved in config file
   */
  [actionType.SET_USER_NAME] ({ state }: ActionContext<UserState, RootState>, name: string): void {
    state.name = name;

    config.set('user.name', name);
  },

  /**
   * Set date, when user access token was last updated.
   * Saved in config file
   */
  [actionType.SET_USER_ACCESS_TOKEN_DATE] ({ state }: ActionContext<UserState, RootState>, value: number): void {
    state.tokenDate = value;

    config.set('user.tokenDate', value);
  },

  /**
   * Send request to validate logined user access token
   */
  async [actionType.VALIDATE_USER_ACCESS_TOKEN] ({
    state,
    rootState,
    dispatch,
  }: ActionContext<UserState, RootState>): Promise<void> {
    return await new Promise((resolve, reject) => {
      if (!state.token || !rootState.clientId) {
        reject(new Error(EMPTY_AUTH));

        return;
      }

      const now = getCurrentUnixTime();

      /**
       * If user data exist and token is considered fresh, skip validation
       */
      if (state.id && state.name && state.tokenDate && now - state.tokenDate < TOKEN_LIFETIME) {
        log.message(
          log.Location.Vuex,
          actionType.VALIDATE_USER_ACCESS_TOKEN,
          'Skip, because lifetime has not passed',
          now - state.tokenDate,
        );

        dispatch(actionType.CONNECT_USER_TO_IRC);

        resolve();

        return;
      }

      dispatch(actionType.SET_APP_LOADING, true);

      const get = request.get(endpoints.VALIDATION, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `OAuth ${state.token}`,
          // 'Client-ID': rootState.clientId,
        },
      });

      get.onload = (data: TwitchTokenValidationResponse) => {
        dispatch(actionType.SET_USER_ACCESS_TOKEN_DATE, getCurrentUnixTime());
        dispatch(actionType.SET_USER_ID, data.user_id);
        dispatch(actionType.SET_USER_NAME, data.login);

        dispatch(actionType.CONNECT_USER_TO_IRC);
        dispatch(actionType.SET_APP_LOADING, false);

        resolve();
      };

      get.onerror = (error) => {
        dispatch(actionType.SET_USER_ACCESS_TOKEN, null);
        dispatch(actionType.SET_APP_LOADING, false);

        reject(new Error(error));
      };
    });
  },

  /**
   * Request user access token from server by opening Twitch auth window
   */
  async [actionType.REQUEST_USER_ACCESS_TOKEN] (
    { dispatch }: ActionContext<UserState, RootState>,
    { clientId, redirectUrl }: {clientId: string; redirectUrl: string},
  ): Promise<boolean> {
    const timestamp = Math.floor(new Date().getTime() / 1000.0);
    const scopes = [
      'channel:read:subscriptions',
      'chat:read',
      'chat:edit',
      'user:read:follows',
    ];
    const url = `${endpoints.AUTH}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=token&state=${timestamp}&scope=${scopes.join('+')}`;
    let result = false;

    dispatch(actionType.SET_APP_LOADING, true);

    try {
      const token = await requestAccessToken(url);

      log.message(log.Location.Vuex, actionType.REQUEST_USER_ACCESS_TOKEN, token);

      dispatch(actionType.SET_USER_ACCESS_TOKEN, token);

      await dispatch(actionType.VALIDATE_USER_ACCESS_TOKEN);

      result = true;
    } catch (error) {
      log.warning(log.Location.Vuex, actionType.REQUEST_USER_ACCESS_TOKEN, error);
    }

    dispatch(actionType.SET_APP_LOADING, false);

    return result;
  },

  /**
   * Revoke logined user access token
   */
  async [actionType.REVOKE_USER_ACCESS_TOKEN] (
    { dispatch }: ActionContext<UserState, RootState>,
    { clientId, token }: {clientId: string; token: string},
  ): Promise<void> {
    return await new Promise((resolve, reject) => {
      if (!token || !clientId) {
        resolve();

        return;
      }

      const url = `${endpoints.LOGOUT}?client_id=${clientId}&token=${token}`;

      dispatch(actionType.SET_APP_LOADING, true);

      const post = request.post(url);

      post.onload = () => {
        dispatch(actionType.SET_USER_ID, null);
        dispatch(actionType.SET_USER_NAME, null);
        dispatch(actionType.SET_USER_ACCESS_TOKEN, null);
        dispatch(actionType.SET_USER_ACCESS_TOKEN_DATE, 0);

        dispatch(actionType.DISCONNECT_USER_FROM_IRC);
        dispatch(actionType.SET_APP_LOADING, false);

        resolve();
      };

      post.onerror = (error) => {
        dispatch(actionType.SET_APP_LOADING, false);

        reject(new Error(error));
      };
    });
  },

  /**
   * Connect logined user to Twitch IRC channel
   */
  [actionType.CONNECT_USER_TO_IRC] ({ state, dispatch }: ActionContext<UserState, RootState>): void {
    const { token, name } = state;

    log.message(log.Location.Vuex, actionType.CONNECT_USER_TO_IRC, token, name);

    if (!token || !name) {
      return;
    }

    irc.connect({
      token,
      name,
    });

    /**
     * When the connection is closed, check if is has to be reopened
     * @param {boolean} isReconnect - if true, make an attempt to reconnect
     */
    irc.onclose = (isReconnect) => {
      log.message(log.Location.IrcManager, 'Disconnected');

      if (isReconnect) {
        setTimeout(() => {
          log.message(log.Location.IrcManager, 'Reconnecting...');

          dispatch(actionType.CONNECT_USER_TO_IRC);
        }, 2000);
      }

      irc.onclose = null;
    };
  },

  /**
   * Disconnect logined user from Twitch IRC channel
   */
  [actionType.DISCONNECT_USER_FROM_IRC] (): void {
    irc.disconnect();
  },
};

export default {
  state: defaultState,
  actions,
};
