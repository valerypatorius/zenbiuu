import { shallowRef, type ShallowRef } from 'vue';
import { tryOnBeforeMount, tryOnBeforeUnmount } from '@vueuse/core';
import type ObservableStore from '@/modules/shared/ObservableStore';

export function useObservableState<T extends object> (store: ObservableStore<T>): { state: ShallowRef<T> } {
  const state = shallowRef(store.state);

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
