import { createSharedComposable } from '@vueuse/core';
import { inject } from 'vue';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';

export const useHub = createSharedComposable(() => {
  const app = inject(Injection.AppProperties);

  if (app === undefined) {
    throw new MissingModuleInjection(Injection.AppProperties);
  }

  return {
    app,
  };
});
