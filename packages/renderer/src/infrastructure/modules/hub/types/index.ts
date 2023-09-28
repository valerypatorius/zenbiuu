import type { HubMainProcessApi } from '@/types/hub';

export interface InterceptedLink {
  method: string;
  payload: Record<string, string | boolean | null | undefined>;
}

export interface InterceptedLinkHookReturnValue {
  off: () => void;
};

export type InterceptedLinkHook = (data: InterceptedLink) => void;

export type InterceptedLinkEvent = CustomEvent<{ link: string }>;

declare global {
  interface Window {
    hub: HubMainProcessApi;
  }
}
