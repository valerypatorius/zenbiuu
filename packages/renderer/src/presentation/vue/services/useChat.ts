import { computed, inject } from 'vue';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useObservableState } from './useObservableState';
import { useAccount } from './useAccount';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useChat () {
  const chat = inject(Injection.Module.Chat);

  if (chat === undefined) {
    throw new MissingModuleInjection(Injection.Module.Chat);
  }

  const { state } = useObservableState(chat.store);

  const messagesByChannel = computed(() => state.value.messagesByChannelName);

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
}
