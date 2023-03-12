import { reactive } from 'vue';
import { createSharedComposable, useEventListener } from '@vueuse/core';
import { HubStateChangeEvent, HubState } from '../../../hub/src/types';

export const useHub = createSharedComposable(() => {
  const state: HubState = reactive(window.hub.getState());

  useEventListener(window, HubStateChangeEvent, (event: CustomEvent<{ state: HubState }>) => {
    const receivedState = event.detail.state;

    Object.entries(receivedState).forEach(([key, value]) => {
      state[key] = value;
    });
  });

  return {
    state,
  };
});
