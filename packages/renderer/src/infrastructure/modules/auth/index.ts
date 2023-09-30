import AuthFailedError from './errors/AuthFailedError';
import AuthStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type Provider from '@/entities/Provider';
import type HubInterface from '@/interfaces/Hub.interface';
import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';

export default class Auth {
  public readonly store = new AuthStore();

  constructor (
    private readonly providers: ProvidersInterface,
    private readonly hub: HubInterface,
  ) {
    /**
     * @todo Authorize transport on startup
     */
  }

  public async authorize (provider: Provider): Promise<string> {
    const providerApi = await this.providers.getApi(provider);

    this.hub.openUrlInBrowser(providerApi.authUrl);

    return await new Promise<string>((resolve, reject) => {
      /**
       * Once url is opened in browser, start listening for app-related events
       */
      const { off } = this.hub.onInterceptedLink(({ method, payload }) => {
        if (method !== 'auth') {
          return;
        }

        /**
         * @todo Add provider name in intercepted link
         */
        const token = payload.token;

        /**
         * Once auth event has been intercepted, stop listening for it regardless of result
         */
        off();

        /**
         * If token is recognized, throw error and do not proceed
         */
        if (typeof token !== 'string') {
          reject(new AuthFailedError());

          return;
        }

        /**
         * Save authorized entity in store
         */
        this.store.saveEntity({
          provider,
          token,
        });

        /**
         * If saved entity is the only one, set it as primary
         */
        if (this.store.state.entities.length === 1) {
          this.store.setPrimaryEntity({
            provider,
            token,
          });
        }

        /**
         * Authorize provider transport
         */
        providerApi.authorizeTransport(token);

        resolve(token);
      });
    });
  }

  public async deauthorize (entity: AuthorizedEntity): Promise<void> {
    const providerApi = await this.providers.getApi(entity.provider);

    await providerApi.deauthorizeToken(entity.token);

    this.store.removeEntity(entity);
  }
}
