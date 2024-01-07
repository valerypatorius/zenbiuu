import type EmotesProviderApi from './EmotesProviderApi.interface';

/**
 * Describes public properties and methods of emotes providers instance
 */
export default interface EmotesProvidersInterface {
  /**
   * Returns api to work with specified emotes provider
   * @param provider - emotes provider name
   */
  getApi: (provider: string) => EmotesProviderApi;
}
