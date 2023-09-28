import { type Account } from '@/modules/account/types';

export interface ProviderApi {
  authUrl: string;
  authorizeTransport: (token: string) => void;
  getAccount: (token: string) => Promise<Account>;
}
