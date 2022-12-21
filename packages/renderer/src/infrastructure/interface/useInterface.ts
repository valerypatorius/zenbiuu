import { ref, computed } from 'vue';
import { createGlobalState } from '@vueuse/core';
import { useRequest } from '@/src/infrastructure/request/useRequest';

export const useInterface = createGlobalState(() => {
  const { isLoading: isRequestLoading } = useRequest();

  const isLoading = computed(() => isRequestLoading.value);

  const isSettingsActive = ref(false);

  return {
    isLoading,
    isSettingsActive,
  };
});
