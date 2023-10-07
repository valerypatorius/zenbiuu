import type AccountEntity from '@/entities/AccountEntity';

/**
 * Describes public properties and methods of a single provider
 */
export default interface ProviderApiInterface {
  connect: (token: string) => void;
  disconnect: () => void;
  login: () => Promise<AccountEntity>;
  logout: (token: string) => Promise<void>;
}
