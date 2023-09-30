import { type GoodgameUser } from './types';
import OAuth from './oauth';
import Transport from './transport';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import Provider from '@/entities/Provider';

export default class Goodgame implements ProviderApiInterface {
  #oauth = new OAuth();
  #transport = new Transport();

  public get authUrl (): string {
    return this.#oauth.url;
  }

  public authorizeTransport (token: string): void {
    this.#transport.setHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log(`Provider [${Provider.Goodgame}] transport authorized`);
  }

  /**
   * @link https://goodgame.ru/html/api4docs/index.html#/public/7b528dd5d7cf871825f17bf075632433
   */
  public async getAccount (token: string): Promise<AccountEntity> {
    const user = await this.#transport.get<GoodgameUser>(`https://goodgame.ru/api/4/users/@me2/?access_token=${token}`);

    return {
      id: user.id.toString(),
      name: user.nickname,
      avatar: `https://goodgame.ru${user.avatar}`,
      token,
      provider: Provider.Goodgame,
    };
  }

  public async deauthorizeToken (token: string): Promise<void> {
  }
}
