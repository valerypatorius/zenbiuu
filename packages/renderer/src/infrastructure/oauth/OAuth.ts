import type OAuthInterface from '@/interfaces/OAuth.interface';
import { convertObjectToLocationQuery, uid } from '@/utils/string';

export default abstract class OAuth implements OAuthInterface {
  public readonly abstract clientId: string;

  protected readonly abstract path: string;

  protected readonly scopes: string[] = [];

  protected readonly redirectUrl: string = import.meta.env.VITE_APP_REDIRECT_URL;

  public get query (): string {
    return convertObjectToLocationQuery({
      response_type: 'token',
      client_id: this.clientId,
      redirect_uri: encodeURIComponent(this.redirectUrl),
      scope: this.scopes.join('+'),
      state: uid(),
      /**
       * @todo Remove after debug
       */
      force_verify: true,
    });
  }

  public get url (): string {
    return `${this.path}?${this.query}`;
  }
}
