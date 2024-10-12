import { createSharedComposable } from '@vueuse/core';
import { inject } from 'vue';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { Injection } from '../injections';

export const useHub = createSharedComposable(() => {
  const app = inject(Injection.AppProperties);

  if (app === undefined) {
    throw new MissingModuleInjection(Injection.AppProperties);
  }

  return {
    app,
  };
});
