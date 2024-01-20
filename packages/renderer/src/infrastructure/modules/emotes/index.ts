import { createEmotesStore } from './store';
import { type ModuleEmotes, type ModuleEmotesStoreSchema } from './types';
import type AccountEntity from '@/entities/AccountEntity';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type EmotesReceivedEvent from '@/entities/EmotesReceivedEvent';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';
import ProviderEvent from '@/entities/ProviderEvent';

export async function createEmotes (state: ModuleStateFactoryFn<ModuleEmotesStoreSchema>, {
  providers,
}: {
  providers: ProvidersInterface;
}): Promise<ModuleEmotes> {
  const store = await createEmotesStore(state);

  let primaryAccount: AccountEntity | undefined;

  window.addEventListener(ProviderEvent.EmotesReceived, handleEmotesReceivedEvent as EventListener);

  function handleEmotesReceivedEvent ({ detail }: EmotesReceivedEvent): void {
    store.addChannelEmotes(detail.id, detail.emotes);
  }

  function requestEmotes (channelId: string): void {
    if (primaryAccount === undefined) {
      return;
    }

    providers.getApi(primaryAccount.provider).requestEmotesForChannelId(channelId);
  }

  return {
    store,
    get primaryAccount () {
      return primaryAccount;
    },
    set primaryAccount (value: AccountEntity | undefined) {
      primaryAccount = value;
    },
    requestEmotes,
  };
}
