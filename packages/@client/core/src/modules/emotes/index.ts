import {
  type AccountEntity,
  type EmotesReceivedEvent,
  type ModuleStateFactoryFn,
  ProviderEvent,
  type ProvidersInterface,
} from '@client/shared';
import { createEmotesStore } from './store';
import type { ModuleEmotes, ModuleEmotesStoreSchema } from './types';

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

  window.addEventListener(
    ProviderEvent.EmotesReceived,
    handleEmotesReceivedEvent as EventListener,
  );

  function handleEmotesReceivedEvent({ detail }: EmotesReceivedEvent): void {
    store.addChannelEmotes(detail.id, detail.emotes);
  }

  function requestEmotes(channelId: string): void {
    if (primaryAccount === null) {
      return;
    }

    providers
      .getApi(primaryAccount.provider)
      .requestEmotesForChannelId(channelId);
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
