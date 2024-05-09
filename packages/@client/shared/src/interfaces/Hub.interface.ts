import { type AppProperties } from '@zenbiuu/shared';
import type InterceptedLinkHookReturnValue from '@/entities/InterceptedLinkHookReturnValue';
import type InterceptedLinkHook from '@/entities/InterceptedLinkHook';

export default interface HubInterface {
  getAppProperties: () => Promise<AppProperties>;
  openUrlInBrowser: (url: string) => void;
  onInterceptedLink: (fn: InterceptedLinkHook) => InterceptedLinkHookReturnValue;
  offInterceptedLink: (fn: InterceptedLinkHook) => void;
}
