import { createEventHook, toReactive, useStorage, watchDebounced, type EventHookOn } from '@vueuse/core';

export function useStore<T extends object> (storeName: string, defaultState: T): {
  state: T;
  onUpdate: EventHookOn<T>;
} {
  /**
   * Initial store object
   */
  const refState = useStorage(`store:${storeName}`, defaultState);

  /**
   * Reactive state reference for ease of use
   */
  const state = toReactive(refState);

  const storeUpdate = createEventHook<T>();
  const storeUpdateDelay = 100;

  watchDebounced(state, () => {
    storeUpdate.trigger(state);
  }, {
    debounce: storeUpdateDelay,
  });

  return {
    state,
    onUpdate: storeUpdate.on,
  };
}
