import { ref } from 'vue';
import { createEventHook, EventHookOn, toReactive, watchDebounced } from '@vueuse/core';
import { store } from '@/src/utils/hub';
import { Schema } from '@/store/schema';

export function useStore<K extends keyof Schema, T extends Schema[K]> (storeName: K, defaultState: T): {
  state: T;
  onUpdate: EventHookOn<T>;
} {
  const refState = ref(defaultState);
  const state = toReactive(refState);
  const storeUpdate = createEventHook<T>();
  const storeUpdateDelay = 100;

  async function init (): Promise<void> {
    refState.value = await store.get(storeName);

    watchDebounced(state, () => {
      store.set(storeName, state);

      storeUpdate.trigger(state);
    }, {
      debounce: storeUpdateDelay,
    });
  }

  void init();

  return {
    state,
    onUpdate: storeUpdate.on,
  };
}
