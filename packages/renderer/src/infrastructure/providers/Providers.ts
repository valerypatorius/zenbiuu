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

  public async getApi (provider: string): Promise<ProviderApiInterface> {
    const storedProviderInstance = this.#providersInstances.get(provider);

    if (storedProviderInstance !== undefined) {
      return storedProviderInstance;
    }

    const { default: Provider } = await import(`./${provider.toLowerCase()}/index.ts`);

    const providerInstance = new Provider(this.hub) as ProviderApiInterface;

    this.#providersInstances.set(provider, providerInstance);

    return providerInstance;
  }
}
