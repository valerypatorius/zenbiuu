import { createSharedComposable } from '@vueuse/core';
import { inject } from 'vue';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { Injection } from '../injections';

export const useProviders = createSharedComposable(() => {
  const providers = inject(Injection.Providers);

  if (providers === undefined) {
    throw new MissingModuleInjection(Injection.Providers);
  }

  const available = providers.available;

  return {
    available,
  };
});
