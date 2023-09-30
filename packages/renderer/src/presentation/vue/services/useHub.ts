import { createSharedComposable } from '@vueuse/core';
import { inject } from 'vue';
import { appPropertiesKey, hubKey } from '../injections';

export const useHub = createSharedComposable(() => {
  const hub = inject(hubKey);
  const app = inject(appPropertiesKey);

  return {
    app,
  };
});
