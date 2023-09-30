import type Provider from './Provider';

export interface AuthorizedEntity {
  token: string;
  provider: Provider;
}
