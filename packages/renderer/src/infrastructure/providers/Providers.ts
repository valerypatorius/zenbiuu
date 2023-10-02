import type ProvidersInterface from '@/interfaces/Providers.interface';
import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';
import type HubInterface from '@/interfaces/Hub.interface';
import Provider from '@/entities/Provider';

export default class Providers implements ProvidersInterface {
  #providersInstances = new Map<Provider, ProviderApiInterface>();

  constructor (
    private readonly hub: HubInterface,
  ) {
  }

  public get available (): Provider[] {
    return [
      Provider.Twitch,
      Provider.Goodgame,
    ];
  }

  public async getApi (provider: Provider): Promise<ProviderApiInterface> {
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
