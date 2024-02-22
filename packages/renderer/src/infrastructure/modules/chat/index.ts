import { createChatStore } from './store';
import { type ModuleChat, type ModuleChatStoreSchema } from './types';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';

export async function createChat(
  state: ModuleStateFactoryFn<ModuleChatStoreSchema>,
  {
    providers,
  }: {
    providers: ProvidersInterface;
  },
): Promise<ModuleChat> {
  const store = await createChatStore(state);

  let primaryAccount: AccountEntity | null = null;

  function join(channelName: string): void {
    if (primaryAccount === null) {
      return;
    }

    providers.getApi(primaryAccount.provider).joinChat(channelName, (message) => {
      store.addChannelMessage(channelName, message);
    });
  }

  function leave(channelName: string): void {
    if (primaryAccount === null) {
      return;
    }

    providers.getApi(primaryAccount.provider).leaveChat(channelName);

    store.clearChannelMessages(channelName);
  }

  function destroy(): void {
    store.clearAll();
  }

  return {
    store,
    get primaryAccount() {
      return primaryAccount;
    },
    set primaryAccount(value: AccountEntity | null) {
      primaryAccount = value;
    },
    join,
    leave,
    destroy,
  };
}
