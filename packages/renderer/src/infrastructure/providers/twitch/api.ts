import { type TwitchUser } from './types';
import { type ProviderApi } from '@/providers/types/api';
import { type Account } from '@/modules/account/types';
import { Provider } from '@/providers/types';
import { type OAuthInterface } from '@/oauth/types';
import { type TransportInterface } from '@/transport/types';

export default class TwitchApi implements ProviderApi {
  constructor (
    private readonly oauth: OAuthInterface,
    private readonly transport: TransportInterface,
  ) {

  }

  public get authUrl (): string {
    return this.oauth.url;
  }

  public authorizeTransport (token: string): void {
    this.transport.setHeaders({
      Authorization: `Bearer ${token}`,
      'Client-Id': this.oauth.clientId,
    });
  }

  public async getAccount (token: string): Promise<Account> {
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
}
