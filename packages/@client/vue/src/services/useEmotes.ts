import { createSharedComposable } from '@vueuse/core';
import { inject, watchEffect } from 'vue';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { Injection } from '../injections';
import { useAccount } from './useAccount';

export const useEmotes = createSharedComposable(() => {
  const emotes = inject(Injection.Module.Emotes);

  if (emotes === undefined) {
    throw new MissingModuleInjection(Injection.Module.Emotes);
  }

  const { primaryAccount } = useAccount();

  watchEffect(() => {
    emotes.primaryAccount = primaryAccount.value;
  });

  function requestEmotes(channelId: string): void {
    emotes?.requestEmotes(channelId);
  }

  return {
    requestEmotes,
    emotesByChannelId: emotes.store.emotesByChannelId,
  };
});
