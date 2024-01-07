import { type ModuleChatStoreSchema } from './types';
import type ChatMessage from '@/entities/ChatMessage';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';
import { clearObject, deleteObjectProperty } from '@/utils/object';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function createChatStore (createState: ModuleStateFactoryFn<ModuleChatStoreSchema>) {
  const { state, save } = await createState('store:chat', {
    messagesByChannelName: {},
  });

  const limit = 100;

  function getMessagesByChannelName (): Record<string, ChatMessage[]> {
    return state.messagesByChannelName;
  }

  function addChatMessage (channelName: string, message: ChatMessage): void {
    const messages = state.messagesByChannelName[channelName];

    if (messages === undefined) {
      state.messagesByChannelName[channelName] = [];
    }

    if (messages !== undefined && messages.length >= limit) {
      state.messagesByChannelName[channelName].shift();
    }

    state.messagesByChannelName[channelName].push(message);

    save();
  }

  function clearChannelMessages (channelName: string): void {
    deleteObjectProperty(state.messagesByChannelName, channelName);

    save();
  }

  function clearAll (): void {
    clearObject(state.messagesByChannelName);

    save();
  }

  return {
    getMessagesByChannelName,
    addChatMessage,
    clearChannelMessages,
    clearAll,
  };
}
