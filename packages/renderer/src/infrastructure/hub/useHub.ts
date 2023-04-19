import { reactive } from 'vue';
import { createEventHook, createSharedComposable, useEventListener } from '@vueuse/core';
import { HubApiKey, HubStateChangeEvent, HubInterceptedLinkEvent, type HubState } from '@/hub/types';

const hubApi = window[HubApiKey];

interface InterceptedRequest {
  method: string;
  payload: Record<string, any>;
}

export const useHub = createSharedComposable(() => {
  const state: HubState = reactive(hubApi.getState());
  const interceptedLinkHook = createEventHook<InterceptedRequest>();

  useEventListener(window, HubStateChangeEvent, (event: CustomEvent<{ state: HubState }>) => {
    const receivedState = event.detail.state;

    Object.entries(receivedState).forEach(([key, value]) => {
      state[key] = value;
    });
  });

  useEventListener(window, HubInterceptedLinkEvent, (event: CustomEvent<{ link: string }>) => {
    const { link } = event.detail;

    try {
      const url = new URL(link);
      const method = url.pathname.replace(/\W/g, '');
      const payload = Array.from(url.searchParams.entries()).reduce<Record<string, any>>((result, [key, rawValue]) => {
        let value;

        switch (rawValue) {
          case 'undefined':
            value = undefined;
            break;
          case 'null':
            value = null;
            break;
          case 'true':
            value = true;
            break;
          case 'false':
            value = false;
            break;
          default:
            value = rawValue;
        }

        result[key] = value;

        return result;
      }, {});

      interceptedLinkHook.trigger({
        method,
        payload,
      });
    } catch (error) {
      console.error('Failed to parse intercepted link', link);
    }
  });

  return {
    ...hubApi,
    state,
    onInterceptedEvent: interceptedLinkHook.on,
  };
});
