import { type Provider } from '@/providers/types';

export interface Account {
  id?: string;
  name?: string;
  avatar?: string;
  token: string;
  provider: Provider;
}
