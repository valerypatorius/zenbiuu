import {
  type ProviderConfig,
  ProviderEvent,
  TransportStatus,
} from './entities';
import type {
  EmotesProvidersInterface,
  HubInterface,
  OAuthInterface,
  SocketsInterface,
  TransportInterface,
} from './interfaces';

export abstract class AbstractPlatformProvider {
  public static readonly config: ProviderConfig;

  public abstract readonly name: string;

  protected abstract readonly clientId: string;

  protected abstract readonly oauth: OAuthInterface;

  protected abstract readonly transport: TransportInterface;

  protected abstract readonly chat: SocketsInterface;

  protected readonly transportHeaders: Record<string, string> = {};

  protected accessToken: string | undefined = undefined;

  constructor(
    protected readonly hub: HubInterface,
    protected readonly emotesProviders: EmotesProvidersInterface,
  ) {}

  protected async requestAuthorization(): Promise<{
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
        if (
          typeof token !== 'string' ||
          typeof state !== 'string' ||
          typeof expiresIn === 'boolean' ||
          typeof expiresIn === 'string'
        ) {
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
  protected async catchable<T>(
    method: 'get' | 'post',
    url: string,
    options?: RequestInit,
    parser?: 'text',
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      this.transport[method]<T>(url, options, parser)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (!(error instanceof Error) || error.cause === undefined) {
            reject(error);

            return;
          }

          if (error.cause === TransportStatus.NotAuthorized) {
            const event = new CustomEvent(ProviderEvent.Disconnect, {
              detail: {
                api: this,
                provider: this.name,
                token: this.accessToken,
              },
            });

            window.dispatchEvent(event);
          }
        });
    });
  }
}
