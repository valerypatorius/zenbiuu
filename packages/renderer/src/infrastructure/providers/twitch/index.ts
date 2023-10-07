import AbstractProvider from '../AbstractProvider';
import { type TwitchValidTokenProperties, type TwitchUser } from './types';
import config from './config';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import OAuth from '@/oauth/OAuth';
import Transport from '@/transport/Transport';
import { getExpirationDateFromNow } from '@/utils/date';
import TransportStatus from '@/entities/TransportStatus';
import ProviderEvent from '@/entities/ProviderEvent';

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

    delete this.transportHeaders.Authorization;
    delete this.transportHeaders['Client-Id'];
  }

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
    const { data } = await this.catchable<{ data: TwitchUser[] }>('get', 'https://api.twitch.tv/helix/users');
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

    await this.catchable('post', `https://id.twitch.tv/oauth2/revoke?client_id=${this.clientId}&token=${token}`);
  }
}
