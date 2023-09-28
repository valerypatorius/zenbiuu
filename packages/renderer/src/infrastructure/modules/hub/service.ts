import ParseInterceptedLinkError from './errors/ParseInterceptedLinkError';
import type { InterceptedLink, InterceptedLinkEvent, InterceptedLinkHook, InterceptedLinkHookReturnValue } from './types';
import { parseString } from '@/utils/string';
import { HubWindowApiKey, HubEvent, type HubAppProperties } from '@/types/hub';

export default class HubService {
  /**
   * API, provided by main process
   */
  private readonly api = window[HubWindowApiKey];

  /**
   * Hooks to call when app link is intercepted
   */
  private readonly interceptedEventsHooks = new Set<InterceptedLinkHook>();

  constructor () {
    window.addEventListener(HubEvent.InterceptedLink, this.handleInterceptedLinkEvent.bind(this) as EventListener);
  }

  /**
   * Returns app properties
   */
  public async getAppProperties (): Promise<HubAppProperties> {
    return this.api.getAppProperties();
  }

  /**
   * Handle intercepted link event by parsing its payload
   * @param event - custom event, dispatched by main process
   */
  private handleInterceptedLinkEvent ({ detail }: InterceptedLinkEvent): void {
    try {
      const data = HubService.parseInterceptedLink(detail.link);

      this.interceptedEventsHooks.forEach((hook) => {
        hook(data);
      });
    } catch (error) {
      throw new ParseInterceptedLinkError();
    }
  }

  /**
   * Parse intercepted link and return useful data object
   * @param source - intercepted link string
   */
  private static parseInterceptedLink (source: string): InterceptedLink {
    const url = new URL(source);
    const method = url.pathname.replace(/\W/g, '');
    const payload = Array.from(url.searchParams.entries()).reduce<InterceptedLink['payload']>((result, [key, value]) => {
      result[key] = parseString(value);

      return result;
    }, {});

    return {
      method,
      payload,
    };
  }

  /**
   * Open specified url in default user's browser
   * @param url - url to load
   */
  public openUrlInBrowser (url: string): void {
    return this.api.openUrlInBrowser(url);
  }

  /**
   * Add hook, which will be called when intercepted link is successfully parsed
   * @param fn - function to call
   */
  public onInterceptedLink (fn: InterceptedLinkHook): InterceptedLinkHookReturnValue {
    this.interceptedEventsHooks.add(fn);

    return {
      off: () => {
        this.offInterceptedLink(fn);
      },
    };
  }

  /**
   * Remove previously added hook
   * @param fn - function, which was called
   */
  public offInterceptedLink (fn: InterceptedLinkHook): void {
    this.interceptedEventsHooks.delete(fn);
  }
}
