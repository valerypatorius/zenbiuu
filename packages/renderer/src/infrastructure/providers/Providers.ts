import type AbstractProvider from './AbstractProvider';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type HubInterface from '@/interfaces/Hub.interface';
import type ProviderConfig from '@/entities/ProviderConfig';

export default class Providers implements ProvidersInterface {
  #providersInstances = new Map<string, ProviderApiInterface>();

  constructor (
    private readonly hub: HubInterface,
  ) {
  }

  public get available (): Record<string, ProviderConfig> {
    const imports = import.meta.glob<ProviderConfig>('./**/config.ts', { import: 'default', eager: true });

    return Object.fromEntries(Object.entries(imports).map(([path, config]) => [config.name, config]));
  }

  public getApi (provider: string): ProviderApiInterface {
    const storedProviderInstance = this.#providersInstances.get(provider);

    if (storedProviderInstance !== undefined) {
      return storedProviderInstance;
    }

    const imports = import.meta.glob<AbstractProvider & (new(hub: HubInterface) => ProviderApiInterface)>('./+([a-z])/index.ts', { import: 'default', eager: true });

    for (const path in imports) {
      if (path.includes(provider)) {
        const providerInstance = new imports[path](this.hub);

        this.#providersInstances.set(provider, providerInstance);

        return providerInstance;
      }
    }

    throw new Error('Provider not found', { cause: provider });
  }
}
