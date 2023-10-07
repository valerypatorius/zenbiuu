import type HubInterface from '@/interfaces/Hub.interface';
import type OAuthInterface from '@/interfaces/OAuth.interface';
import type ProviderConfig from '@/entities/ProviderConfig';
import type TransportInterface from '@/interfaces/Transport.interface';

export default abstract class AbstractProvider {
  protected readonly abstract config: ProviderConfig;

  protected readonly abstract clientId: string;

  protected readonly abstract oauth: OAuthInterface;

  protected readonly abstract transport: TransportInterface;

  protected accessToken: string | undefined = undefined;

  protected readonly transportHeaders: Record<string, string> = {};

  constructor (
    protected readonly hub: HubInterface,
  ) {}

  public async requestAuthorization (): Promise<{
    token: string;
    state: string;
    expiresIn?: number | null;
  }> {
    this.hub.openUrlInBrowser(this.oauth.url);

    return await new Promise((resolve, reject) => {
      /**
       * Once url is opened in browser, start listening for app-related events
       */
      const { off } = this.hub.onInterceptedLink(({ method, payload }) => {
        if (method !== 'auth') {
          return;
        }

        const { token, state, expiresIn } = payload;

        /**
         * Once auth event has been intercepted, stop listening for it regardless of result
         */
        off();

        /**
         * If payload is not recognized, throw error and do not proceed
         */
        if (typeof token !== 'string' || typeof state !== 'string' || typeof expiresIn === 'boolean' || typeof expiresIn === 'string') {
          reject(new Error('Failed to process authorization response'));

          return;
        }

        resolve({
          token,
          state,
          expiresIn,
        });
      });
    });
  }
}
