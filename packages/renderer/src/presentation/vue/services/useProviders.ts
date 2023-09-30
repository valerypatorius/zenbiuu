import { createSharedComposable } from '@vueuse/core';
import { inject } from 'vue';
import { providersKey } from '../injections';

export const useProviders = createSharedComposable(() => {
  const providers = inject(providersKey);

  const available = providers.available;

  return {
    available,
  };
});
