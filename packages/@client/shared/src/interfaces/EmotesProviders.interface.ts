import type { EmotesProviderApiInterface } from '.';

/**
 * Describes public properties and methods of emotes providers instance
 */
export interface EmotesProvidersInterface {
  /**
   * Returns api to work with specified emotes provider
   * @param provider - emotes provider name
   */
  getApi: (provider: string) => EmotesProviderApiInterface;
}
