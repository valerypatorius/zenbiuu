import { createEmotesStore } from './store';
import { type ModuleEmotes, type ModuleEmotesStoreSchema } from './types';
import {
  type ProvidersInterface,
  type AccountEntity,
  type ModuleStateFactoryFn,
  type EmotesReceivedEvent,
  ProviderEvent,
} from '@client/shared';

export async function createEmotes(
  state: ModuleStateFactoryFn<ModuleEmotesStoreSchema>,
  {
    providers,
  }: {
    providers: ProvidersInterface;
  },
): Promise<ModuleEmotes> {
  const store = await createEmotesStore(state);

  let primaryAccount: AccountEntity | null = null;

  window.addEventListener(ProviderEvent.EmotesReceived, handleEmotesReceivedEvent as EventListener);

  function handleEmotesReceivedEvent({ detail }: EmotesReceivedEvent): void {
    store.addChannelEmotes(detail.id, detail.emotes);
  }

  function requestEmotes(channelId: string): void {
    if (primaryAccount === null) {
      return;
    }

    providers.getApi(primaryAccount.provider).requestEmotesForChannelId(channelId);
  }

  return {
    store,
    get primaryAccount() {
      return primaryAccount;
    },
    set primaryAccount(value: AccountEntity | null) {
      primaryAccount = value;
    },
    requestEmotes,
  };
}
