import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createSharedComposable, tryOnBeforeUnmount, tryOnMounted } from '@vueuse/core';
import { useUser } from './useUser';
import { type TwitchTokenValidationResponse } from './types';
import { getCurrentUnixTime } from '@/src/utils/utils';
import date from '@/src/utils/date';
import { RouteName } from '@/src/infrastructure/router/types';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { useIrc } from '@/src/infrastructure/irc/useIrc';
import { useInterval } from '@/src/infrastructure/interval/useInterval';
import { useHub } from '@/src/infrastructure/hub/useHub';

/**
 * Max lifetime of auth token before validation is required
 */
const TOKEN_LIFETIME = date.Hour;

/** User token update interval */
const TOKEN_UPDATE_INTERVAL = date.Hour;

export enum UserError {
  FailedAuth = 'Authorization failed',
  MissingAuthToken = 'Missing authorized user token',
};

enum UserEndpoint {
  Authorize = 'https://id.twitch.tv/oauth2/authorize',
  Validate = 'https://id.twitch.tv/oauth2/validate',
  Revoke = 'https://id.twitch.tv/oauth2/revoke',
  Integrity = 'https://gql.twitch.tv/integrity',
}

/**
 * Get access token from specified url
 */
function getAccessTokenUrl (url: string): string | null {
  const modifiedUrl = url.replace('#', '?');
  const urlObject = new URL(modifiedUrl);
  const result = urlObject.searchParams.get('access_token');

  return result;
}

export const useAuth = createSharedComposable(() => {
  const { state: userState, clear: clearUser } = useUser();
  const route = useRoute();
  const router = useRouter();
  const { get, post } = useRequest();
  const { connect: connectToIrc, disconnect: disconnectFromIrc } = useIrc();
  const { start: startInterval } = useInterval();
  const { state: hubState, waitForRedirect } = useHub();

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
    if (userState.token === undefined) {
      if (route.name !== RouteName.Auth) {
        void router.replace(RouteName.Auth);
      }

      await Promise.reject(UserError.MissingAuthToken);
      return;
    }

    const now = getCurrentUnixTime();
    const tokenTimePassed = now - (userState.tokenDate ?? 0);

    /**
     * If user data exist and token is considered fresh, skip validation
     */
    if (
      userState.id !== undefined &&
      userState.name !== undefined &&
      userState.tokenDate !== undefined &&
      tokenTimePassed < TOKEN_LIFETIME
    ) {
      connectToIrc();

      if (route.name === undefined) {
        void router.replace(RouteName.Library);
      }

      return;
    }

    try {
      const response = await get<TwitchTokenValidationResponse>(UserEndpoint.Validate, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `OAuth ${userState.token}`,
        },
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
      client_id: hubState.clientId,
      redirect_uri: encodeURIComponent(hubState.redirectUrl),
      response_type: 'token',
      state: getCurrentUnixTime(),
      scope: scopes.join('+'),
    };

    const query = Object.entries(params).map(([key, string]) => `${key}=${string}`).join('&');
    const redirectedAuthUrl = await waitForRedirect(`${UserEndpoint.Authorize}?${query}`);
    const token = getAccessTokenUrl(redirectedAuthUrl);

    if (token === null) {
      await Promise.reject(UserError.FailedAuth);
      return;
    }

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
      client_id: hubState.clientId,
      token: userState.token,
    };

    const query = Object.entries(params).map(([key, string]) => `${key}=${string}`).join('&');

    await post(`${UserEndpoint.Revoke}?${query}`, undefined, { headers: undefined });

    disconnectFromIrc();
    clearUser();
  }

  return {
    validate,
    authorize,
    deauthorize,
  };
});
