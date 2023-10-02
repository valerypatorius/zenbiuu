import type OAuthInterface from '@/interfaces/OAuth.interface';
import { convertObjectToLocationQuery, uid } from '@/utils/string';

export default class OAuth implements OAuthInterface {
  protected readonly redirectUrl = import.meta.env.VITE_APP_REDIRECT_URL;

  constructor (
    private readonly path: string,
    private readonly clientId: string,
    private readonly scopes: string[] = [],
  ) {
  }

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
