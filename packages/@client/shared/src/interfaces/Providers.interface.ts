import type { ProviderApiInterface } from '.';
import type { ProviderConfig } from '../entities';

/**
 * Describes public properties and methods of providers instance
 */
export interface ProvidersInterface {
  /**
   * List of available providers' configurations
   */
  available: Record<string, ProviderConfig>;

  /**
   * Returns api to work with specified provider
   * @param provider - provider name
   */
  getApi: (provider: string) => ProviderApiInterface;
}
