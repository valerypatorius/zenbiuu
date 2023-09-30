import { type TwitchUser } from './types';
import OAuth from './oauth';
import Transport from './transport';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import Provider from '@/entities/Provider';

export default class Twitch implements ProviderApiInterface {
  #oauth = new OAuth();
  #transport = new Transport();

  public get authUrl (): string {
    return this.#oauth.url;
  }

  public authorizeTransport (token: string): void {
    this.#transport.setHeaders({
      Authorization: `Bearer ${token}`,
      'Client-Id': this.#oauth.clientId,
    });

    console.log(`Provider [${Provider.Twitch}] transport authorized`);
  }

  /**
   * @link https://dev.twitch.tv/docs/api/reference/#get-users
   */
  public async getAccount (token: string): Promise<AccountEntity> {
    const { data } = await this.#transport.get<{ data: TwitchUser[] }>('https://api.twitch.tv/helix/users');
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
  public async deauthorizeToken (token: string): Promise<void> {
    console.log('deauthorize twitch', token);
    console.log(this.#transport);
    throw new Error('aboba');
    // await this.transport.post('https://id.twitch.tv/oauth2/revoke', {
    //   client_id: this.oauth.clientId,
    //   token,
    // });
  }
}
