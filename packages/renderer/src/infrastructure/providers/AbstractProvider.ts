import type HubInterface from '@/interfaces/Hub.interface';
import type OAuthInterface from '@/interfaces/OAuth.interface';
import type ProviderConfig from '@/entities/ProviderConfig';
import type TransportInterface from '@/interfaces/Transport.interface';
import type SocketsInterface from '@/interfaces/Sockets.interface';
import type EmotesProvidersInterface from '@/interfaces/EmotesProviders.interface';
import TransportStatus from '@/entities/TransportStatus';
import ProviderEvent from '@/entities/ProviderEvent';

export default abstract class AbstractProvider {
  protected readonly abstract config: ProviderConfig;

  protected readonly abstract clientId: string;

  protected readonly abstract oauth: OAuthInterface;

  protected readonly abstract transport: TransportInterface;

  protected readonly abstract chat: SocketsInterface;

  protected readonly transportHeaders: Record<string, string> = {};

  protected accessToken: string | undefined = undefined;

  constructor (
    protected readonly hub: HubInterface,
    protected readonly emotesProviders: EmotesProvidersInterface,
  ) {}

  protected async requestAuthorization (): Promise<{
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

  /**
   * @todo If token is not validated at this moment, wait for it
   */
  protected async catchable <T>(method: 'get' | 'post', url: string, options?: RequestInit, parser?: 'text'): Promise<T> {
    return await new Promise((resolve, reject) => {
      this.transport[method]<T>(url, options, parser).then((result) => {
        resolve(result);
      }).catch((error) => {
        if (!(error instanceof Error) || error.cause === undefined) {
          reject(error);

          return;
        }

        if (error.cause === TransportStatus.NotAuthorized) {
          const event = new CustomEvent(ProviderEvent.Disconnect, {
            detail: {
              api: this,
              provider: this.config.name,
              token: this.accessToken,
            },
          });

          window.dispatchEvent(event);
        }
      });
    });
  }
}
