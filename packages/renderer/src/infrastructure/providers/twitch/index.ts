import AbstractProvider from '../AbstractProvider';
import { type TwitchUser } from './types';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import OAuth from '@/oauth/OAuth';
import Provider from '@/entities/Provider';
import Transport from '@/transport/Transport';

export default class Twitch extends AbstractProvider implements ProviderApiInterface {
  #clientId = import.meta.env.VITE_TWITCH_APP_CLIENT_ID;

  protected readonly oauth = new OAuth('https://id.twitch.tv/oauth2/authorize', this.#clientId, [
    'chat:read',
    'chat:edit',
    'channel:moderate',
    'user:read:follows',
    'channel:read:subscriptions',
  ]);

  protected readonly transport = new Transport(this.transportHeaders);

  public authorize (token?: string): void {
    this.accessToken = token;

    if (this.accessToken === undefined) {
      delete this.transportHeaders.Authorization;
      delete this.transportHeaders['Client-Id'];
    } else {
      this.transportHeaders.Authorization = `Bearer ${this.accessToken}`;
      this.transportHeaders['Client-Id'] = this.#clientId;
    }

    console.log('authorize twitch', token);

    this.transport.get('https://api.twitch.tv/helix/streams/followed?user_id=76197514').then((response) => {
      console.log('Request followed streams', response);
    });
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async login (): Promise<AccountEntity> {
    const token = await super.requestAccessToken();

    this.authorize(token);

    const { data } = await this.transport.get<{ data: TwitchUser[] }>('https://api.twitch.tv/helix/users');
    const user = data[0];

    return {
      id: user.id,
      name: user.display_name,
      avatar: user.profile_image_url,
      token,
      provider: Provider.Twitch,
    };
  }

  /**
   * @link https://dev.twitch.tv/docs/authentication/revoke-tokens/
   */
  public async logout (token: string): Promise<void> {
    this.authorize(undefined);

    await this.transport.post(`https://id.twitch.tv/oauth2/revoke?client_id=${this.#clientId}&token=${token}`);
  }
}
