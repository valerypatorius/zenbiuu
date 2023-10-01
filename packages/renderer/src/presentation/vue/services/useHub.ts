import { createSharedComposable } from '@vueuse/core';
import { inject } from 'vue';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';

export const useHub = createSharedComposable(() => {
  const hub = inject(Injection.Module.Hub);
  const app = inject(Injection.AppProperties);

  if (hub === undefined) {
    throw new MissingModuleInjection(Injection.Module.Hub);
  }

  if (app === undefined) {
    throw new MissingModuleInjection(Injection.AppProperties);
  }

  return {
    app,
  };
});
