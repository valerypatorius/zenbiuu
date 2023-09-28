import { type GoodgameUser } from './types';
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
    });
  }

  public async getAccount (token: string): Promise<Account> {
    const user = await this.transport.get<GoodgameUser>(`https://goodgame.ru/api/4/users/@me2/?access_token=${token}`);

    return {
      id: user.id.toString(),
      name: user.nickname,
      avatar: `https://goodgame.ru${user.avatar}`,
      token,
      provider: Provider.Goodgame,
    };
  }
}
