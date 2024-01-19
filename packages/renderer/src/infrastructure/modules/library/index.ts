import { createLibraryStore } from './store';
import { type ModuleLibraryStoreSchema, type ModuleLibrary } from './types';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';

export async function createLibrary (state: ModuleStateFactoryFn<ModuleLibraryStoreSchema>, {
  providers,
}: {
  providers: ProvidersInterface;
}): Promise<ModuleLibrary> {
  const store = await createLibraryStore(state);

  const namesBuffer = new Set<string>();

  let primaryAccount: AccountEntity | undefined;

  let namesTimeoutId: ReturnType<typeof setTimeout> | undefined;

  async function requestFollowedChannelsNames (): Promise<void> {
    if (primaryAccount === undefined) {
      return;
    }

    const names = await providers.getApi(primaryAccount.provider).getFollowedChannelsNamesByUserId(primaryAccount.id);

    store.followedChannelsNames = names;
  }

  async function requestFollowedLiveStreams (): Promise<void> {
    if (primaryAccount === undefined) {
      return;
    }

    const streams = await providers.getApi(primaryAccount.provider).getFollowedStreamsByUserId(primaryAccount.id);

    const streamsByChannelName = streams.reduce<Record<string, LiveStream>>((result, item) => {
      result[item.channelName] = item;

      return result;
    }, {});

    store.liveStreamsByChannelName = streamsByChannelName;
  }

  async function requestChannelByName (name: string): Promise<void> {
    const channels = store.channelsByName;

    if (channels.get(name) !== undefined || namesBuffer.has(name)) {
      return;
    }

    namesBuffer.add(name);

    clearTimeout(namesTimeoutId);

    namesTimeoutId = setTimeout(() => {
      if (primaryAccount === undefined) {
        namesBuffer.clear();

        return;
      }

      providers.getApi(primaryAccount.provider).getChannelsByNames(Array.from(namesBuffer)).then((channels) => {
        channels.forEach((channel) => {
          store.saveChannelByName(channel.name, channel);
        });
      });

      namesBuffer.clear();
    }, 300);
  }

  async function playStream (name: string, stream?: LiveStream): Promise<string | undefined> {
    if (primaryAccount === undefined) {
      return;
    }

    return providers.getApi(primaryAccount.provider).playStream(name, stream);
  }

  async function stopStream (name: string): Promise<void> {
    if (primaryAccount === undefined) {
      return;
    }

    await providers.getApi(primaryAccount.provider).stopStream(name);
  }

  function destroy (): void {
    clearTimeout(namesTimeoutId);
    namesTimeoutId = undefined;

    namesBuffer.clear();
    store.clear();

    primaryAccount = undefined;
  }

  return {
    store,
    get primaryAccount () {
      return primaryAccount;
    },
    set primaryAccount (value: AccountEntity | undefined) {
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
