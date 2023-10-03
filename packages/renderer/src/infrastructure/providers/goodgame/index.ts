import AbstractProvider from '../AbstractProvider';
import { type GoodgameUser } from './types';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type AccountEntity from '@/entities/AccountEntity';
import OAuth from '@/oauth/OAuth';
import Provider from '@/entities/Provider';
import Transport from '@/transport/Transport';
import { getExpirationDateFromNow } from '@/utils/date';

export default class Goodgame extends AbstractProvider implements ProviderApiInterface {
  #clientId = import.meta.env.VITE_GOODGAME_APP_CLIENT_ID;

  protected readonly oauth = new OAuth({
    name: Provider.Goodgame,
    path: 'https://goodgame.ru/oauth2/authorize',
    clientId: this.#clientId,
    scopes: [],
  });

  protected readonly transport = new Transport(this.transportHeaders);

  public async connect (token: string): Promise<undefined> {
    this.accessToken = token;

    this.transportHeaders.Authorization = `Bearer ${this.accessToken}`;
  }

  public disconnect (): void {
    delete this.transportHeaders.Authorization;
  }

  /**
   * @link https://goodgame.ru/html/api4docs/index.html#/public/7b528dd5d7cf871825f17bf075632433
   */
  public async login (): Promise<AccountEntity> {
    const { token, expiresIn } = await super.requestAuthorization();

    await this.connect(token);

    const user = await this.transport.get<GoodgameUser>(`https://goodgame.ru/api/4/users/@me2/?access_token=${token}`);

    return {
      id: user.id.toString(),
      name: user.nickname,
      avatar: `https://goodgame.ru${user.avatar}`,
      token,
      provider: Provider.Goodgame,
      tokenExpirationDate: typeof expiresIn === 'number' ? getExpirationDateFromNow(expiresIn) : undefined,
    };
  }

  public async logout (token: string): Promise<void> {
    this.disconnect();
  }
}
