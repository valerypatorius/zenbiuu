import { watch, ref } from 'vue';
import { createGlobalState, toReactive, tryOnBeforeUnmount, tryOnMounted, createEventHook } from '@vueuse/core';
import { useInterfaceState } from './useInterfaceState';
import { config, requestAccessToken } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';
import request from '@/src/utils/request';
import log from '@/src/utils/log';
import { getCurrentUnixTime } from '@/src/utils/utils';
import date from '@/src/utils/date';
import { TwitchTokenValidationResponse } from '@/types/renderer/user';
import irc from '@/src/utils/irc';
import interval from '@/src/utils/interval';
import type { IntervalManagerItem } from '../utils/interval';

/**
 * Max lifetime of auth token before validation is required
 */
const TOKEN_LIFETIME = date.Hour;

/** User token update interval */
const TOKEN_UPDATE_INTERVAL = date.Hour;

export enum UserError {
  MissingAuthToken = 'Missing authorized user token',
};

enum UserEndpoint {
  Authorize = 'https://id.twitch.tv/oauth2/authorize',
  Validate = 'https://id.twitch.tv/oauth2/validate',
  Revoke = 'https://id.twitch.tv/oauth2/revoke',
}

export const useUserState = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.User]>({
    token: null,
    tokenDate: 0,
    id: null,
    name: null,
  });

  const state = toReactive(refState);

  const { state: interfaceState } = useInterfaceState();

  /** Interval for token validation */
  const tokenInterval = ref<IntervalManagerItem | null>(null);

  const validateSuccess = createEventHook<boolean>();

  const validateError = createEventHook<Error>();

  init();

  /**
   * Start token interval on mount
   */
  tryOnMounted(() => {
    tokenInterval.value = interval.start(TOKEN_UPDATE_INTERVAL);
    tokenInterval.value.onupdate = validate;
  });

  /**
   * Stop token interval on unmount
   */
  tryOnBeforeUnmount(() => {
    if (!tokenInterval.value) {
      return;
    }

    interval.stop(tokenInterval.value);
    tokenInterval.value = null;
  });

  async function init (): Promise<void> {
    refState.value = await config.get(Module.User);

    // watch(state, () => {
    //   config.set(Module.User, state);
    // });
  }

  /**
   * Validate user access token
   */
  async function validate (): Promise<void> {
    if (!state.token) {
      const error = new Error(UserError.MissingAuthToken);

      validateError.trigger(error);

      return await Promise.reject(error);
    }

    const now = getCurrentUnixTime();
    const tokenTimePassed = now - state.tokenDate;

    /**
     * If user data exist and token is considered fresh, skip validation
     */
    if (
      state.id &&
      state.name &&
      state.tokenDate &&
      tokenTimePassed < TOKEN_LIFETIME
    ) {
      log.message(
        log.Location.State,
        'Skip, because lifetime has not passed',
        tokenTimePassed,
      );

      connectToIrc();

      validateSuccess.trigger(true);

      return await Promise.resolve();
    }

    interfaceState.isLoading = true;

    return await new Promise((resolve, reject) => {
      const get = request.get(UserEndpoint.Validate, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `OAuth ${state.token}`,
        },
      });

      get.onload = async (data: TwitchTokenValidationResponse) => {
        state.tokenDate = getCurrentUnixTime();
        state.id = data.user_id;
        state.name = data.login;

        connectToIrc();

        interfaceState.isLoading = false;

        resolve();
      };

      get.onerror = async (error) => {
        state.token = null;

        interfaceState.isLoading = false;

        reject(new Error(error));
      };
    });
  }

  async function authorize (): Promise<void> {
    const scopes = [
      'channel:read:subscriptions',
      'chat:read',
      'user:read:follows',
      'channel:moderate',
    ];

    const params = {
      client_id: import.meta.env.VITE_APP_CLIENT_ID,
      redirect_uri: encodeURIComponent(import.meta.env.VITE_APP_REDIRECT_URL),
      response_type: 'token',
      state: getCurrentUnixTime(),
      scope: scopes.join('+'),
    };

    const paramsString = Object.entries(params).map(([key, string]) => `${key}=${string}`).join('&');

    const url = `${UserEndpoint.Authorize}?${paramsString}`;

    interfaceState.isLoading = true;

    return await new Promise((resolve, reject) => {
      try {
        requestAccessToken(url)
          .then((token) => {
            state.token = token;

            log.message(log.Location.State, 'Token received', state.token);
          })
          .then(validate)
          .then(resolve);
      } catch (error) {
        log.warning(log.Location.State, 'Token not received', error);

        reject(new Error(UserError.MissingAuthToken));
      } finally {
        interfaceState.isLoading = false;
      }
    });
  }

  /**
   * Revoke access token for logined user
   */
  async function deauthorize (): Promise<void> {
    if (!state.token) {
      return await Promise.resolve();
    }

    const url = `${UserEndpoint.Revoke}?client_id=${import.meta.env.VITE_APP_CLIENT_ID}&token=${state.token}`;

    interfaceState.isLoading = true;

    return await new Promise((resolve, reject) => {
      const post = request.post(url);

      post.onload = () => {
        state.id = null;
        state.name = null;
        state.token = null;
        state.tokenDate = 0;

        disconnectFromIrc();

        interfaceState.isLoading = false;

        resolve();
      };

      post.onerror = (error) => {
        interfaceState.isLoading = false;

        reject(new Error(error));
      };
    });
  }

  /**
   * Connect authorized user to IRC
   */
  function connectToIrc (): void {
    const { token, name } = state;

    log.message(log.Location.State, 'Connecting to IRC', token, name);

    if (!token || !name) {
      return;
    }

    irc.connect({
      token,
      name,
    });

    /**
     * When the connection is closed, check if it has to be reopened
     * @param isReconnect - if true, make an attempt to reconnect
     */
    irc.onclose = (isReconnect) => {
      log.message(log.Location.IrcManager, 'Disconnected');

      if (isReconnect) {
        setTimeout(() => {
          log.message(log.Location.IrcManager, 'Reconnecting...');

          connectToIrc();
        }, 2000);
      }

      irc.onclose = null;
    };
  }

  /**
   * Disconnect user from IRC
   */
  function disconnectFromIrc (): void {
    irc.disconnect();
  }

  return {
    state,
    validate,
    authorize,
    deauthorize,
    onValidateSuccess: validateSuccess.on,
    onValidateError: validateError.on,
  };
});
