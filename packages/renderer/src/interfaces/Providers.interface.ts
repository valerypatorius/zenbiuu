import type Provider from '@/entities/Provider';
import type ProviderApi from './ProviderApi.interface';

/**
 * Describes public properties and methods of providers instance
 */
export default interface ProvidersInterface {
  /**
   * List of available providers
   */
  available: Provider[];

  /**
   * Returns api to work with specified provider
   * @param provider - provider name
   */
  getApi: (provider: Provider) => Promise<ProviderApi>;
}
