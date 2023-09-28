// import AuthFailedError from './errors/AuthFailedError';
// import AuthProviderMissingError from './errors/AuthProviderMissingError';
import AuthFailedError from './errors/AuthFailedError';
import type HubService from '@/modules/hub/service';
import type AuthStore from './store';
import { type ProvidersInterface, type Provider } from '@/providers/types';

export default class AuthService {
  constructor (
    private readonly store: AuthStore,
    private readonly hubService: HubService,
    private readonly providers: ProvidersInterface,
  ) {
  }

  public async authorize (provider: Provider): Promise<string> {
    const providerApi = await this.providers.getApi(provider);

    this.hubService.openUrlInBrowser(providerApi.authUrl);

    /**
     * @todo Distinguish between providers (e.g. when multiple auth are happening at the same time)
     */
    return await new Promise<string>((resolve, reject) => {
      /**
       * Once url is opened in browser, start listening for app-related events
       */
      const { off } = this.hubService.onInterceptedLink(({ method, payload }) => {
        if (method !== 'auth') {
          return;
        }

        const token = payload.token;

        /**
         * Once auth event has been intercepted, stop listening for it regardless of result
         */
        off();

        if (typeof token === 'string') {
          /**
           * If token is recognized, save it to storage
           */
          this.store.setToken(provider, token);

          /**
           * Authorized provider transport
           */
          providerApi.authorizeTransport(token);

          resolve(token);
        } else {
          reject(new AuthFailedError());
        }
      });
    });
  }

  public async deauthorize (): Promise<void> {

  }
}
