import type AccountEntity from '@/entities/AccountEntity';

/**
 * Describes public properties and methods of a single provider
 */
export default interface ProviderApiInterface {
  authUrl: string;
  authorizeTransport: (token: string) => void;
  getAccount: (token: string) => Promise<AccountEntity>;
  deauthorizeToken: (token: string) => Promise<void>;
}
