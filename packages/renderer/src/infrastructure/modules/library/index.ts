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

  let namesTimeoutId: ReturnType<typeof setTimeout> | undefined;

  async function requestFollowedChannelsNames (account: AccountEntity): Promise<void> {
    const names = await providers.getApi(account.provider).getFollowedChannelsNamesByUserId(account.id);

    store.setFollowedChannelsNames(names);
  }

  async function requestFollowedLiveStreams (account: AccountEntity): Promise<void> {
    const streams = await providers.getApi(account.provider).getFollowedStreamsByUserId(account.id);

    const streamsByChannelName = streams.reduce<Record<string, LiveStream>>((result, item) => {
      result[item.channelName] = item;

      return result;
    }, {});

    store.setLiveStreamsByChannelName(streamsByChannelName);
  }

  async function requestChannelByName (account: AccountEntity, name: string): Promise<void> {
    const channels = store.getChannelsByName();

    if (name in channels || namesBuffer.has(name)) {
      return;
    }

    namesBuffer.add(name);

    clearTimeout(namesTimeoutId);

    namesTimeoutId = setTimeout(() => {
      providers.getApi(account.provider).getChannelsByNames(Array.from(namesBuffer)).then((channels) => {
        channels.forEach((channel) => {
          store.addChannelByName(channel.name, channel);
        });
      });

      namesBuffer.clear();
    }, 300);
  }

  async function getChannelPlaylistUrl (account: AccountEntity, name: string): Promise<string | undefined> {
    return providers.getApi(account.provider).getChannelPlaylistUrl(name);
  }

  function activateChannel (name: string): void {
    store.addActiveChannelName(name);
  }

  function deactivateChannel (name: string): void {
    store.removeActiveChannelName(name);
  }

  function deactivateAllChannels (): void {
    store.clearActiveChannelNames();
  }

  function destroy (): void {
    store.clear();
  }

  return {
    requestFollowedChannelsNames,
    requestFollowedLiveStreams,
    requestChannelByName,
    getChannelPlaylistUrl,
    activateChannel,
    deactivateChannel,
    deactivateAllChannels,
    destroy,
    getLiveStreamsByChannelName: store.getLiveStreamsByChannelName,
    getChannelsByNames: store.getChannelsByName,
    getActiveChannelsNames: store.getActiveChannelsNames,
    getFollowedChannelsNames: store.getFollowedChannelsNames,
  };
}
