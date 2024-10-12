import type {
  AccountEntity,
  LiveStream,
  ModuleStateFactoryFn,
  ProvidersInterface,
} from '@client/shared';
import { createLibraryStore } from './store';
import type { ModuleLibrary, ModuleLibraryStoreSchema } from './types';

export async function createLibrary(
  state: ModuleStateFactoryFn<ModuleLibraryStoreSchema>,
  {
    providers,
  }: {
    providers: ProvidersInterface;
  },
): Promise<ModuleLibrary> {
  const store = await createLibraryStore(state);

  const namesBuffer = new Set<string>();

  let primaryAccount: AccountEntity | null = null;

  let namesTimeoutId: ReturnType<typeof setTimeout> | undefined;

  async function requestFollowedChannelsNames(): Promise<void> {
    if (primaryAccount === null) {
      return;
    }

    const names = await providers
      .getApi(primaryAccount.provider)
      .getFollowedChannelsNamesByUserId(primaryAccount.id);

    store.followedChannelsNames = names;
  }

  async function requestFollowedLiveStreams(): Promise<void> {
    if (primaryAccount === null) {
      return;
    }

    const streams = await providers
      .getApi(primaryAccount.provider)
      .getFollowedStreamsByUserId(primaryAccount.id);

    const streamsByChannelName = streams.reduce<Record<string, LiveStream>>(
      (result, item) => {
        result[item.channelName] = item;

        return result;
      },
      {},
    );

    store.liveStreamsByChannelName = streamsByChannelName;
  }

  function requestChannelByName(name: string): void {
    const channels = store.channelsByName;

    if (channels.get(name) !== undefined || namesBuffer.has(name)) {
      return;
    }

    namesBuffer.add(name);

    clearTimeout(namesTimeoutId);

    namesTimeoutId = setTimeout(() => {
      if (primaryAccount === null) {
        namesBuffer.clear();

        return;
      }

      void providers
        .getApi(primaryAccount.provider)
        .getChannelsByNames(Array.from(namesBuffer))
        .then((channels) => {
          for (const channel of channels) {
            store.saveChannelByName(channel.name, channel);
          }
        });

      namesBuffer.clear();
    }, 300);
  }

  async function playStream(
    name: string,
    stream?: LiveStream,
  ): Promise<string | undefined> {
    if (primaryAccount === null) {
      return;
    }

    return providers.getApi(primaryAccount.provider).playStream(name, stream);
  }

  function stopStream(name: string): void {
    if (primaryAccount === null) {
      return;
    }

    providers.getApi(primaryAccount.provider).stopStream(name);
  }

  function destroy(): void {
    clearTimeout(namesTimeoutId);
    namesTimeoutId = undefined;

    namesBuffer.clear();
    store.clear();

    primaryAccount = null;
  }

  return {
    store,
    get primaryAccount() {
      return primaryAccount;
    },
    set primaryAccount(value: AccountEntity | null) {
      primaryAccount = value;
    },
    requestFollowedChannelsNames,
    requestFollowedLiveStreams,
    requestChannelByName,
    playStream,
    stopStream,
    destroy,
  };
}
