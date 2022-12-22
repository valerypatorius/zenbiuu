import { ref, toRaw } from 'vue';
import { createEventHook, EventHookOn, toReactive, watchDebounced } from '@vueuse/core';
import { store } from '@/src/utils/hub';
import { Schema } from '@/store/schema';

export function useStore<K extends keyof Schema, T extends Schema[K]> (storeName: K, defaultState: T): {
  state: T;
  onUpdate: EventHookOn<T>;
  onReady: EventHookOn<T>;
} {
  const refState = ref(defaultState);
  /**
   * Make reactive object for ease of use
   */
  const state = toReactive(refState);
  const storeUpdate = createEventHook<T>();
  const storeUpdateDelay = 100;
  const storeReady = createEventHook<T>();

  async function init (): Promise<void> {
    refState.value = await store.get(storeName);

    watchDebounced(state, () => {
      /**
       * Save original state object
       */
      store.set(storeName, toRaw(refState.value));

      storeUpdate.trigger(state);
    }, {
      debounce: storeUpdateDelay,
    });
  }

  void init().then(() => {
    storeReady.trigger(state);
  });

  return {
    state,
    onUpdate: storeUpdate.on,
    onReady: storeReady.on,
  };
}
