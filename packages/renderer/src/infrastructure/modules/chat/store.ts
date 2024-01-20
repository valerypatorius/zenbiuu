import { type ModuleChatStore, type ModuleChatStoreSchema } from './types';
import type ChatMessage from '@/entities/ChatMessage';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';

export async function createChatStore (createState: ModuleStateFactoryFn<ModuleChatStoreSchema>): Promise<ModuleChatStore> {
  const { state } = await createState('store:chat', {
    messagesByChannelName: new Map(),
  });

  const limit = 100;

  let isLastAddedMessageEven = false;

  function addChannelMessage (channelName: string, message: ChatMessage): void {
    let messages = state.messagesByChannelName.get(channelName);

    if (messages === undefined) {
      messages = [];
      state.messagesByChannelName.set(channelName, messages);
    }

    if (messages.length >= limit) {
      messages.shift();
    }

    message.isEven = isLastAddedMessageEven;

    messages.push(message);

    isLastAddedMessageEven = !isLastAddedMessageEven;
  }

  function clearChannelMessages (channelName: string): void {
    state.messagesByChannelName.delete(channelName);
  }

  function clearAll (): void {
    state.messagesByChannelName.clear();
  }

  return {
    get messagesByChannelName () {
      return state.messagesByChannelName;
    },
    addChannelMessage,
    clearChannelMessages,
    clearAll,
  };
}
