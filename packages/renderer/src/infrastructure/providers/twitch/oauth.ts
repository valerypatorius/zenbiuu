import OAuth from '@/oauth/OAuth';

/**
 * @link https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#implicit-grant-flow
 */
export default class TwitchAuth extends OAuth {
  protected readonly path = 'https://id.twitch.tv/oauth2/authorize';

  protected readonly scopes = [
    'chat:read',
    'chat:edit',
    'channel:moderate',
    'user:read:follows',
    'channel:read:subscriptions',
  ];

  public readonly clientId = import.meta.env.VITE_TWITCH_APP_CLIENT_ID;
}
