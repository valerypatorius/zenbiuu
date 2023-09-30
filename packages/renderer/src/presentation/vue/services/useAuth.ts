import { createEventHook, createSharedComposable } from '@vueuse/core';
import { computed, inject } from 'vue';
import { authModuleKey } from '../injections';
import { useObservableState } from './useObservableState';
import { useErrors } from './useErrors';
import type Provider from '@/entities/Provider';
import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';

export const useAuth = createSharedComposable(() => {
  const auth = inject(authModuleKey);

  const { state } = useObservableState(auth.store);
  const { catchable } = useErrors();

  const entities = computed(() => state.value.entities);
  const primaryEntity = computed(() => state.value.primary);

  const authorizedHook = createEventHook<AuthorizedEntity>();

  const deauthorizedHook = createEventHook<AuthorizedEntity>();

  async function authorize (provider: Provider): Promise<void> {
    await catchable(async () => {
      const token = await auth.authorize(provider);

      await authorizedHook.trigger({
        provider,
        token,
      });
    });
  }

  async function deauthorize (entity: AuthorizedEntity): Promise<void> {
    await catchable(async () => {
      await auth.deauthorize(entity);

      await deauthorizedHook.trigger(entity);
    });
  }

  function setPrimaryEntity (value: AuthorizedEntity): void {
    auth.store.setPrimaryEntity(value);
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
