import { inject, watchEffect } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useAccount } from './useAccount';
import type { ChannelEntity } from '@client/shared';

export const useChat = createSharedComposable(() => {
  const chat = inject(Injection.Module.Chat);

  if (chat === undefined) {
    throw new MissingModuleInjection(Injection.Module.Chat);
  }

  const { primaryAccount } = useAccount();

  watchEffect(() => {
    chat.primaryAccount = primaryAccount.value;
  });

  function join(channel: ChannelEntity): void {
    chat?.join(channel.name);
  }

  function leave(channel: ChannelEntity): void {
    chat?.leave(channel.name);
  }

  return {
    join,
    leave,
    messagesByChannel: chat.store.messagesByChannelName,
  };
});