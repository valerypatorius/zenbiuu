import { shallowRef, type ShallowRef } from 'vue';
import { tryOnBeforeMount, tryOnBeforeUnmount } from '@vueuse/core';
import type ObservableStore from '@/modules/shared/store/ObservableStore';

export function useObservableState<T extends object> (store: ObservableStore<T>): { state: ShallowRef<T> } {
  /**
   * Use shallow ref to avoid unnecessary reactivity for nested objects
   */
  const state = shallowRef(store.state);

  /**
   * Each time store updates, we update local state too
   */
  const updateState = (value: T): void => {
    state.value = value;
  };

  tryOnBeforeMount(() => {
    store.observe(updateState);
  });

  tryOnBeforeUnmount(() => {
    store.unobserve(updateState);
  });

  return {
    state,
  };
}
