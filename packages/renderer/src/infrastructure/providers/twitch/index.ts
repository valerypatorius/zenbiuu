import AbstractProvider from '../AbstractProvider';
import config from './config';
import type { TwitchValidTokenProperties, TwitchUser, TwitchStream, TwitchFollowedChannel, TwitchResponse } from './types';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';
import OAuth from '@/oauth/OAuth';
import Transport from '@/transport/Transport';
import { getExpirationDateFromNow } from '@/utils/date';
import TransportStatus from '@/entities/TransportStatus';
import ProviderEvent from '@/entities/ProviderEvent';
import { deleteObjectProperty } from '@/utils/object';

export default class Twitch extends AbstractProvider implements ProviderApiInterface {
  protected readonly config = config;

  protected readonly clientId = import.meta.env.VITE_TWITCH_APP_CLIENT_ID;

  protected readonly oauth = new OAuth({
    name: this.config.name,
    path: this.config.oauthPath,
    clientId: this.clientId,
    scopes: [
      'chat:read',
      'chat:edit',
      'channel:moderate',
      'user:read:follows',
      'channel:read:subscriptions',
    ],
  });

  protected readonly transport = new Transport(this.transportHeaders);

  private isTokenValidated = false;

  /**
   * @todo If token is not validated at this moment, wait for it
   */
  private async catchable <T>(method: 'get' | 'post', url: string, options?: RequestInit, parser?: 'text'): Promise<T> {
    return await new Promise((resolve, reject) => {
      this.transport[method]<T>(url, options, parser).then((result) => {
        resolve(result);
      }).catch((error) => {
        if (!(error instanceof Error) || error.cause === undefined) {
          reject(error);

          return;
        }

        if (error.cause === TransportStatus.NotAuthorized) {
          console.log('not authorized');
          const event = new CustomEvent(ProviderEvent.Disconnect, {
            detail: {
              api: this,
              provider: this.config.name,
              token: this.accessToken,
            },
          });

          window.dispatchEvent(event);
        }
      });
    });
  }

  private async callTwitchApi<T> (endpoint: string): Promise<TwitchResponse<T>['data']> {
    const chunk = await this.catchable<TwitchResponse<T>>('get', endpoint);
    const result = chunk.data;

    let cursor = chunk.pagination?.cursor;

    /**
     * If pagination cursor is present, call API again and again until all data is received
     */
    while (cursor !== undefined) {
      const url = new URL(endpoint);

      url.searchParams.append('after', cursor);

      const chunk = await this.catchable<TwitchResponse<T>>('get', url.href);

      result.push(...chunk.data);

      cursor = chunk.pagination?.cursor;
    }

    return result;
  }

  public connect (token: string): void {
    /**
     * When connecting provider to token, reset its validation state
     */
    if (this.accessToken !== undefined) {
      this.isTokenValidated = false;
    }

    this.accessToken = token;

    this.transportHeaders.Authorization = `Bearer ${this.accessToken}`;
    this.transportHeaders['Client-Id'] = this.clientId;

    /**
     * If token is not validated, call validation, but do not wait for it
     */
    if (!this.isTokenValidated) {
      void this.validate(this.accessToken);
    }
  }

  public disconnect (): void {
    this.accessToken = undefined;
    this.isTokenValidated = false;

    deleteObjectProperty(this.transportHeaders, 'Authorization');
    deleteObjectProperty(this.transportHeaders, 'Client-Id');
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
   */
  private async validate (token: string): Promise<string> {
    const { expires_in: expiresIn } = await this.catchable<TwitchValidTokenProperties>('get', 'https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.isTokenValidated = true;

    return getExpirationDateFromNow(expiresIn);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async login (): Promise<AccountEntity> {
    /**
     * Receive access token
     */
    const { token } = await super.requestAuthorization();

    /**
     * Disconnect provider from previous token
     */
    this.disconnect();

    /**
     * Validate received token and receive token expiration date
     */
    const tokenExpirationDate = await this.validate(token);

    /**
     * Connect provider with new token
     */
    this.connect(token);

    /**
     * Receive user data
     */
    const data = await this.callTwitchApi<TwitchUser>('https://api.twitch.tv/helix/users');
    const user = data[0];

    return {
      id: user.id,
      name: user.display_name,
      avatar: user.profile_image_url,
      token,
      provider: this.config.name,
      tokenExpirationDate,
    };
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/revoke-tokens/
   */
  public async logout (token: string): Promise<void> {
    this.disconnect();

    await this.catchable<never>('post', `https://id.twitch.tv/oauth2/revoke?client_id=${this.clientId}&token=${token}`);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-followed-channels
   */
  public async getFollowedChannelsNamesByUserId (id: string): Promise<string[]> {
    const data = await this.callTwitchApi<TwitchFollowedChannel>(`https://api.twitch.tv/helix/channels/followed?user_id=${id}&first=100`);

    return data.map((item) => item.broadcaster_name);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-followed-streams
   */
  public async getFollowedStreamsByUserId (id: string): Promise<LiveStream[]> {
    const data = await this.callTwitchApi<TwitchStream>(`https://api.twitch.tv/helix/streams/followed?user_id=${id}&first=100`);

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      cover: item.thumbnail_url.replace('{width}x{height}', '640x360'),
      category: item.game_name,
      channelName: item.user_name,
      viewersCount: item.viewer_count,
      dateStarted: item.started_at,
    }));
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async getChannelsByNames (names: string[]): Promise<ChannelEntity[]> {
    if (names.length === 0) {
      throw new Error('Users names are not provided');
    }

    const searchQuery = `login=${names.map((name) => name.toLowerCase()).join('&login=')}`;

    /**
     * @todo Deal with exceeding 100 items limit
     */
    const data = await this.callTwitchApi<TwitchUser>(`https://api.twitch.tv/helix/users?${searchQuery}`);

    /**
     * @todo Deal with banned channels
     */
    return data.map((item) => ({
      id: item.id,
      name: item.display_name,
      avatar: item.profile_image_url,
      offlineCover: item.offline_image_url,
    }));
  }
}
