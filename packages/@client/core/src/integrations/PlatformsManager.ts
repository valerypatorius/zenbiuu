import type {
  ProvidersInterface,
  ProviderApiInterface,
  HubInterface,
  ProviderConfig,
  EmotesProvidersInterface,
} from '@client/shared';
import { PlatformProvider } from './config';

export class PlatformsManager implements ProvidersInterface {
  readonly #providersInstances = new Map<string, ProviderApiInterface>();

  constructor(
    private readonly hub: HubInterface,
    private readonly emotesProviders: EmotesProvidersInterface,
  ) {}

  public get available(): Record<string, ProviderConfig> {
    return Object.fromEntries(
      Object.entries(PlatformProvider).map(
        ([
          name,
          fn,
        ]) => [
          name,
          fn.config,
        ],
      ),
    );
  }

  public getApi(providerName: string): ProviderApiInterface {
    const storedProviderInstance = this.#providersInstances.get(providerName);

    if (storedProviderInstance !== undefined) {
      return storedProviderInstance;
    }

    if (!(providerName in PlatformProvider)) {
      throw new Error('Platform provider not found', { cause: providerName });
    }

    const fn = PlatformProvider[providerName as keyof typeof PlatformProvider];

    const providerInstance = new fn(this.hub, this.emotesProviders);

    this.#providersInstances.set(providerName, providerInstance);

    return providerInstance;
  }
}
