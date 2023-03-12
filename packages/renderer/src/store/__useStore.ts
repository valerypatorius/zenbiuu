import { createEventHook, EventHookOn, toReactive, useStorage, watchDebounced } from '@vueuse/core';
import { Schema } from '@/src/store/types/schema';

export function useStore<K extends keyof Schema, T extends Schema[K]> (storeName: K, defaultState: T): {
  state: T;
  onUpdate: EventHookOn<T>;
} {
  /**
   * Initial store object
   */
  const refState = useStorage(`store:${storeName as string}`, defaultState);

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
