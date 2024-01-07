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

  window.addEventListener(ProviderEvent.EmotesReceived, handleEmotesReceivedEvent as EventListener);

  function handleEmotesReceivedEvent ({ detail }: EmotesReceivedEvent): void {
    store.addChannelEmotes(detail.id, detail.emotes);
  }

  function requestEmotes (account: AccountEntity, channelId: string): void {
    providers.getApi(account.provider).requestEmotesForChannelId(channelId);
  }

  return {
    getEmotesByChannelId: store.getEmotesByChannelId,
    requestEmotes,
  };
}
