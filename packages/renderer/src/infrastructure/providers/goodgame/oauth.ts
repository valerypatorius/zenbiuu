import OAuth from '@/oauth/OAuth';

/**
 * @link https://github.com/GoodGame/api4-php-client/#browser-based-application
 */
export default class GoodgameAuth extends OAuth {
  protected readonly path = 'https://goodgame.ru/oauth2/authorize';

  public readonly clientId = import.meta.env.VITE_GOODGAME_APP_CLIENT_ID;
}
