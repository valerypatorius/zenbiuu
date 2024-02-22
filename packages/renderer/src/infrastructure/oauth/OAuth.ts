import type OAuthInterface from '@/interfaces/OAuth.interface';
import { convertObjectToLocationQuery, uid } from '@/utils/string';

interface OAuthConstructorParams {
  name: string;
  path: string;
  clientId: string;
  scopes?: string[];
}

export default class OAuth implements OAuthInterface {
  protected readonly redirectUrl = import.meta.env.VITE_APP_REDIRECT_URL;

  readonly #name: string;
  readonly #path: string;
  readonly #clientId: string;
  readonly #scopes: string[];

  constructor({ name, path, clientId, scopes }: OAuthConstructorParams) {
    this.#name = name;
    this.#path = path;
    this.#clientId = clientId;
    this.#scopes = scopes ?? [];
  }

  private get query(): string {
    return convertObjectToLocationQuery({
      response_type: 'token',
      client_id: this.#clientId,
      redirect_uri: encodeURIComponent(this.redirectUrl),
      scope: this.#scopes.join('+'),
      state: `${this.#name}:${uid()}`,
      /**
       * @todo Remove after debug
       */
      force_verify: true,
    });
  }

  public get url(): string {
    return `${this.#path}?${this.query}`;
  }
}
