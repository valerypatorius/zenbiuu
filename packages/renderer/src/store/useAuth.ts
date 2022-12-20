import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createGlobalState, tryOnBeforeUnmount, tryOnMounted } from '@vueuse/core';
import { requestAccessToken } from '@/src/utils/hub';
import { getCurrentUnixTime } from '@/src/utils/utils';
import date from '@/src/utils/date';
import { TwitchTokenValidationResponse } from '@/types/renderer/user';
import interval from '@/src/utils/interval';
import type { IntervalManagerItem } from '../utils/interval';
import { RouteName } from '@/types/renderer/router';
import { useRequest } from '../utils/useRequest';
import { useUser } from './useUser';
import { useIrc } from '../utils/useIrc';

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

export const useAuth = createGlobalState(() => {
  const { state: userState } = useUser();
  const route = useRoute();
  const router = useRouter();
  const { get, post } = useRequest();
  const { connect: connectToIrc, disconnect: disconnectFromIrc } = useIrc();

  /** Interval for token validation */
  const tokenInterval = ref<IntervalManagerItem | null>(null);

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

  /**
   * Validate user access token
   */
  async function validate (): Promise<void> {
    if (!userState.token) {
      if (route.name !== RouteName.Auth) {
        router.replace(RouteName.Auth);
      }

      return await Promise.reject(UserError.MissingAuthToken);
    }

    const now = getCurrentUnixTime();
    const tokenTimePassed = now - userState.tokenDate;

    /**
     * If user data exist and token is considered fresh, skip validation
     */
    if (
      userState.id &&
      userState.name &&
      userState.tokenDate &&
      tokenTimePassed < TOKEN_LIFETIME
    ) {
      connectToIrc(userState.name, userState.token);

      if (!route.name) {
        router.replace(RouteName.Library);
      }

      return;
    }

    try {
      const response = await get<TwitchTokenValidationResponse>(UserEndpoint.Validate, {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `OAuth ${userState.token}`,
      });

      userState.tokenDate = now;
      userState.id = response.user_id;
      userState.name = response.login;

      connectToIrc(userState.name, userState.token);
    } catch (error) {
      userState.token = undefined;
    }
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

    const query = Object.entries(params).map(([key, string]) => `${key}=${string}`).join('&');
    const token = await requestAccessToken(`${UserEndpoint.Authorize}?${query}`);

    userState.token = token;
  }

  /**
   * Revoke access token for logined user
   */
  async function deauthorize (): Promise<void> {
    const params = {
      client_id: import.meta.env.VITE_APP_CLIENT_ID,
      token: userState.token,
    };

    const query = Object.entries(params).map(([key, string]) => `${key}=${string}`).join('&');

    await post(`${UserEndpoint.Revoke}?${query}`);

    disconnectFromIrc();

    userState.id = undefined;
    userState.name = undefined;
    userState.token = undefined;
    userState.tokenDate = 0;
  }

  return {
    validate,
    authorize,
    deauthorize,
  };
});
