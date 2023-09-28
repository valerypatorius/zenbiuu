import { computedAsync, createSharedComposable } from '@vueuse/core';
import hub from '@/modules/hub';

export const useHub = createSharedComposable(() => {
  const app = computedAsync(async () => hub.service.getAppProperties(), {
    name: '',
    version: '',
    locale: '',
  });

  return {
    app,
  };
});
