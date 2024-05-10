import type { EmotesProvidersInterface, EmotesProviderApiInterface } from '@client/shared';
import { EmotesProvider } from './config';

export class EmotesManager implements EmotesProvidersInterface {
  readonly #providersInstances = new Map<string, EmotesProviderApiInterface>();

  public getApi(providerName: string): EmotesProviderApiInterface {
    const storedProviderInstance = this.#providersInstances.get(providerName);

    if (storedProviderInstance !== undefined) {
      return storedProviderInstance;
    }

    if (!(providerName in EmotesProvider)) {
      throw new Error('Emotes provider not found', { cause: providerName });
    }

    const fn = EmotesProvider[providerName as keyof typeof EmotesProvider];

    const providerInstance = new fn();

    this.#providersInstances.set(providerName, providerInstance);

    return providerInstance;
  }
}
