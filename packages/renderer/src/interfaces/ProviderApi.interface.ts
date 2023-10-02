import type AccountEntity from '@/entities/AccountEntity';

/**
 * Describes public properties and methods of a single provider
 */
export default interface ProviderApiInterface {
  authorize: (token: string) => void;
  login: () => Promise<AccountEntity>;
  logout: (token: string) => Promise<void>;
}
