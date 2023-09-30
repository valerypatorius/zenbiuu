import type Provider from './Provider';

export default interface AccountEntity {
  id?: string;
  name?: string;
  avatar?: string;
  token: string;
  provider: Provider;
}
