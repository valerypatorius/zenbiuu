import AbstractProvider from '../AbstractProvider';
import { type TwitchValidTokenProperties, type TwitchUser } from './types';
import config from './config';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import OAuth from '@/oauth/OAuth';
import Transport from '@/transport/Transport';
import { getExpirationDateFromNow } from '@/utils/date';

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

  public async connect (token: string): Promise<string> {
    this.accessToken = token;

    this.transportHeaders.Authorization = `Bearer ${this.accessToken}`;

    /**
     * @todo Improve by specifying empty headers for request itself
     */
    delete this.transportHeaders['Client-Id'];

    const { expires_in: expiresIn } = await this.transport.get<TwitchValidTokenProperties>('https://id.twitch.tv/oauth2/validate');

    this.transportHeaders['Client-Id'] = this.clientId;

    return getExpirationDateFromNow(expiresIn);
  }

  public disconnect (): void {
    this.accessToken = undefined;

    delete this.transportHeaders.Authorization;
    delete this.transportHeaders['Client-Id'];
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async login (): Promise<AccountEntity> {
    const { token } = await super.requestAuthorization();
    const tokenExpirationDate = await this.connect(token);

    const { data } = await this.transport.get<{ data: TwitchUser[] }>('https://api.twitch.tv/helix/users');
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

    await this.transport.post(`https://id.twitch.tv/oauth2/revoke?client_id=${this.clientId}&token=${token}`);
  }
}
