import type { AppProperties } from '@zenbiuu/shared';
import type { InterceptedLinkHook, InterceptedLinkHookReturnValue } from '../entities';

export interface HubInterface {
  getAppProperties: () => Promise<AppProperties>;
  openUrlInBrowser: (url: string) => void;
  onInterceptedLink: (fn: InterceptedLinkHook) => InterceptedLinkHookReturnValue;
  offInterceptedLink: (fn: InterceptedLinkHook) => void;
  setThemeSource: (value: 'system' | 'dark' | 'light') => void;
}
