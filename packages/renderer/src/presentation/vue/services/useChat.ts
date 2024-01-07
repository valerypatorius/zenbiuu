import { computed, inject } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useAccount } from './useAccount';

export const useChat = createSharedComposable(() => {
  const chat = inject(Injection.Module.Chat);

  if (chat === undefined) {
    throw new MissingModuleInjection(Injection.Module.Chat);
  }

  const messagesByChannel = computed(() => chat.getMessagesByChannelName());

  const { primaryAccount } = useAccount();

  function join (channel: string): void {
    if (primaryAccount.value !== undefined) {
      chat?.join(primaryAccount.value, channel);
    }
  }

  function leave (channel: string): void {
    if (primaryAccount.value !== undefined) {
      chat?.leave(primaryAccount.value, channel);
    }
  }

  return {
    join,
    leave,
    messagesByChannel,
  };
});
