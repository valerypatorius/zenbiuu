import type AbstractProvider from './AbstractProvider';
import type EmotesProvidersInterface from '@/interfaces/EmotesProviders.interface';
import type EmotesProviderApiInterface from '@/interfaces/EmotesProviderApi.interface';

export default class EmotesProviders implements EmotesProvidersInterface {
  readonly #providersInstances = new Map<string, EmotesProviderApiInterface>();

  public getApi(provider: string): EmotesProviderApiInterface {
    const storedProviderInstance = this.#providersInstances.get(provider);

    if (storedProviderInstance !== undefined) {
      return storedProviderInstance;
    }

    const imports = import.meta.glob<AbstractProvider & (new () => EmotesProviderApiInterface)>(
      './+([0-9a-z])/index.ts',
      { import: 'default', eager: true },
    );

    for (const path in imports) {
      if (path.includes(provider)) {
        const providerInstance = new imports[path]();

        this.#providersInstances.set(provider, providerInstance);

        return providerInstance;
      }
    }

    throw new Error('Emotes provider not found', { cause: provider });
  }
}
