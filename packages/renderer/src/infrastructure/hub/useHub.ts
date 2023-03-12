import { reactive } from 'vue';
import { createSharedComposable, useEventListener } from '@vueuse/core';
import { HubApiKey, HubStateChangeEvent, type HubState } from '@/hub/types';

const hubApi = window[HubApiKey];

export const useHub = createSharedComposable(() => {
  const state: HubState = reactive(hubApi.getState());

  useEventListener(window, HubStateChangeEvent, (event: CustomEvent<{ state: HubState }>) => {
    const receivedState = event.detail.state;

    Object.entries(receivedState).forEach(([key, value]) => {
      state[key] = value;
    });
  });

  return {
    ...hubApi,
    state,
  };
});
