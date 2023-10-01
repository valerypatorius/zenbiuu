import { createEventHook, createSharedComposable } from '@vueuse/core';
import { computed, inject } from 'vue';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useObservableState } from './useObservableState';
import { useErrors } from './useErrors';
import type Provider from '@/entities/Provider';
import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';

export const useAuth = createSharedComposable(() => {
  const auth = inject(Injection.Module.Auth);

  if (auth === undefined) {
    throw new MissingModuleInjection(Injection.Module.Auth);
  }

  const { state } = useObservableState(auth.store);
  const { catchable } = useErrors();

  const entities = computed(() => state.value.entities);
  const primaryEntity = computed(() => state.value.primary);

  const authorizedHook = createEventHook<AuthorizedEntity>();

  const deauthorizedHook = createEventHook<AuthorizedEntity>();

  async function authorize (provider: Provider): Promise<void> {
    await catchable(async () => {
      const token = await auth?.authorize(provider);

      if (token === undefined) {
        return;
      }

      await authorizedHook.trigger({
        provider,
        token,
      });
    });
  }

  async function deauthorize (entity: AuthorizedEntity): Promise<void> {
    await catchable(async () => {
      await auth?.deauthorize(entity);

      await deauthorizedHook.trigger(entity);
    });
  }

  function setPrimaryEntity (value: AuthorizedEntity): void {
    auth?.setPrimaryEntity(value);
  }

  function isPrimaryEntity ({ token, provider }: AuthorizedEntity): boolean {
    const { primary } = state.value;

    if (primary === undefined) {
      return false;
    }

    return primary.provider === provider && primary.token === token;
  }

  return {
    entities,
    primaryEntity,
    setPrimaryEntity,
    isPrimaryEntity,
    authorize,
    deauthorize,
    onAuthorized: authorizedHook.on,
    onDeauthorized: deauthorizedHook.on,
  };
});
