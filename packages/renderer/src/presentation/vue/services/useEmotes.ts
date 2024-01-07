import { computed, inject } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useAccount } from './useAccount';

export const useEmotes = createSharedComposable(() => {
  const emotes = inject(Injection.Module.Emotes);

  if (emotes === undefined) {
    throw new MissingModuleInjection(Injection.Module.Emotes);
  }

  const { primaryAccount } = useAccount();

  const emotesByChannelId = computed(() => emotes.getEmotesByChannelId());

  function requestEmotes (channelId: string): void {
    if (primaryAccount.value !== undefined) {
      emotes?.requestEmotes(primaryAccount.value, channelId);
    }
  }

  return {
    requestEmotes,
    emotesByChannelId,
  };
});
