import type ProviderApi from './ProviderApi.interface';
import type ProviderConfig from '@/entities/ProviderConfig';

/**
 * Describes public properties and methods of providers instance
 */
export default interface ProvidersInterface {
  /**
   * List of available providers' configurations
   */
  available: Record<string, ProviderConfig>;

  /**
   * Returns api to work with specified provider
   * @param provider - provider name
   */
  getApi: (provider: string) => Promise<ProviderApi>;
}
