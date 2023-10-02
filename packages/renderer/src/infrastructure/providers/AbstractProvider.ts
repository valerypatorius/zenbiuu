import type HubInterface from '@/interfaces/Hub.interface';
import type OAuthInterface from '@/interfaces/OAuth.interface';
import { type TransportInterface } from '@/transport/types';

export default abstract class AbstractProvider {
  protected readonly abstract oauth: OAuthInterface;

  protected readonly abstract transport: TransportInterface;

  protected accessToken: string | undefined = undefined;

  protected readonly transportHeaders: Record<string, string> = {};

  constructor (
    protected readonly hub: HubInterface,
  ) {}

  public async requestAccessToken (): Promise<string> {
    this.hub.openUrlInBrowser(this.oauth.url);

    return await new Promise((resolve, reject) => {
      /**
       * Once url is opened in browser, start listening for app-related events
       */
      const { off } = this.hub.onInterceptedLink(({ method, payload }) => {
        if (method !== 'auth') {
          return;
        }

        /**
         * @todo Include provider name in intercepted link
         */
        const token = payload.token;

        /**
         * Once auth event has been intercepted, stop listening for it regardless of result
         */
        off();

        /**
         * If token is not recognized, throw error and do not proceed
         */
        if (typeof token !== 'string') {
          reject(new Error('Failed to process access token after successfull authorization'));

          return;
        }

        resolve(token);
      });
    });
  }
}
