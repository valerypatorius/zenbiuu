import { createChatStore } from './store';
import { type ModuleChat, type ModuleChatStoreSchema } from './types';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';

export async function createChat (state: ModuleStateFactoryFn<ModuleChatStoreSchema>, {
  providers,
}: {
  providers: ProvidersInterface;
}): Promise<ModuleChat> {
  const store = await createChatStore(state);

  function join (account: AccountEntity, channelName: string): void {
    providers.getApi(account.provider).joinChat(channelName, (message) => {
      store.addChatMessage(channelName, message);
    });
  }

  function leave (account: AccountEntity, channelName: string): void {
    providers.getApi(account.provider).leaveChat(channelName);

    store.clearChannelMessages(channelName);
  }

  function destroy (): void {
    store.clearAll();
  }

  return {
    join,
    leave,
    destroy,
    getMessagesByChannelName: store.getMessagesByChannelName,
  };
}
