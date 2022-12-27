import { ref, computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useRequest } from '@/src/infrastructure/request/useRequest';

export const useInterface = createSharedComposable(() => {
  const { isLoading: isRequestLoading } = useRequest();

  const isLoading = computed(() => isRequestLoading.value);

  const isSettingsActive = ref(false);

  return {
    isLoading,
    isSettingsActive,
  };
});
