import AbstractProvider from '../AbstractProvider';
import { type GoodgameUser } from './types';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import OAuth from '@/oauth/OAuth';
import Provider from '@/entities/Provider';
import Transport from '@/transport/Transport';

export default class Goodgame extends AbstractProvider implements ProviderApiInterface {
  #clientId = import.meta.env.VITE_GOODGAME_APP_CLIENT_ID;

  protected readonly oauth = new OAuth('https://goodgame.ru/oauth2/authorize', this.#clientId);

  protected readonly transport = new Transport(this.transportHeaders);

  public authorize (token?: string): void {
    this.accessToken = token;

    if (this.accessToken === undefined) {
      delete this.transportHeaders.Authorization;
    } else {
      this.transportHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    console.log('authorize goodgame', token);
  }

  /**
   * @link https://goodgame.ru/html/api4docs/index.html#/public/7b528dd5d7cf871825f17bf075632433
   */
  public async login (): Promise<AccountEntity> {
    const token = await super.requestAccessToken();

    this.authorize(token);

    const user = await this.transport.get<GoodgameUser>(`https://goodgame.ru/api/4/users/@me2/?access_token=${token}`);

    return {
      id: user.id.toString(),
      name: user.nickname,
      avatar: `https://goodgame.ru${user.avatar}`,
      token,
      provider: Provider.Goodgame,
    };
  }

  public async logout (token: string): Promise<void> {
    this.authorize(undefined);
  }
}
