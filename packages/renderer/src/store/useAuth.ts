import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createGlobalState, tryOnBeforeUnmount, tryOnMounted } from '@vueuse/core';
import { requestAccessToken } from '@/src/utils/hub';
import { getCurrentUnixTime } from '@/src/utils/utils';
import date from '@/src/utils/date';
import { TwitchTokenValidationResponse } from '@/types/renderer/user';
import { RouteName } from '@/types/renderer/router';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { useUser } from '@/src/store/useUser';
import { useIrc } from '@/src/infrastructure/irc/useIrc';
import { useInterval } from '@/src/infrastructure/interval/useInterval';

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
  const { state: userState, clear: clearUser } = useUser();
  const route = useRoute();
  const router = useRouter();
  const { get, post } = useRequest();
  const { connect: connectToIrc, disconnect: disconnectFromIrc } = useIrc();
  const { start: startInterval } = useInterval();

  /** Stop function for token validation interval */
  const stopTokenInterval = ref<() => void>();

  /**
   * Start token interval on mount
   */
  tryOnMounted(() => {
    stopTokenInterval.value = startInterval(validate, TOKEN_UPDATE_INTERVAL, {
      immediate: true,
    });
  });

  /**
   * Stop token interval on unmount
   */
  tryOnBeforeUnmount(() => {
    if (stopTokenInterval.value !== undefined) {
      stopTokenInterval.value();
      stopTokenInterval.value = undefined;
    }
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
      connectToIrc();

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

      connectToIrc();
    } catch (error) {
      clearUser();
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

    /**
     * Call validation to receive user name and id
     */
    await validate();
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

    await post(`${UserEndpoint.Revoke}?${query}`, undefined, {});

    disconnectFromIrc();
    clearUser();
  }

  return {
    validate,
    authorize,
    deauthorize,
  };
});
