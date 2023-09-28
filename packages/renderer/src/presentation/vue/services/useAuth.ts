import { createSharedComposable } from '@vueuse/core';
import { computed } from 'vue';
import { useObservableState } from './useObservableState';
import { useErrors } from './useErrors';
import auth from '@/modules/auth';
import account from '@/modules/account';
import { type Provider } from '@/providers/types';

export const useAuth = createSharedComposable(() => {
  const { state } = useObservableState(auth.store);
  const { catchable } = useErrors();

  const tokens = computed(() => state.value.tokens);

  async function authorize (provider: Provider): Promise<void> {
    await catchable(async () => {
      const token = await auth.service.authorize(provider);

      await account.service.getDataByToken(provider, token);
    });
  }

  async function deauthorize (): Promise<void> {

  }

  return {
    tokens,
    authorize,
    deauthorize,
  };
});
