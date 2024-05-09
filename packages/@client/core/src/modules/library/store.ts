import { type ModuleLibraryStore, type ModuleLibraryStoreSchema } from './types';
import type { ChannelEntity, LiveStream, ModuleStateFactoryFn } from '@client/shared';

export async function createLibraryStore(
  createState: ModuleStateFactoryFn<ModuleLibraryStoreSchema>,
): Promise<ModuleLibraryStore> {
  const { state, save } = await createState('store:library', {
    followedChannelsNames: new Set(),
    selectedChannelsNames: new Set(),
    liveStreamsByChannelName: new Map(),
    channelsByName: new Map(),
  });

  function saveChannelByName(name: string, channel: ChannelEntity): void {
    state.channelsByName.set(name, channel);

    save();
  }

  function addSelectedChannelName(name: string): void {
    state.selectedChannelsNames.add(name);

    save();
  }

  function removeSelectedChannelName(name: string): void {
    state.selectedChannelsNames.delete(name);

    save();
  }

  function removeAllSelectedChannelsNames(): void {
    state.selectedChannelsNames.clear();

    save();
  }

  function clear(): void {
    state.followedChannelsNames.clear();
    state.selectedChannelsNames.clear();
    state.liveStreamsByChannelName.clear();
    state.channelsByName.clear();

    save();
  }

  return {
    get followedChannelsNames(): Set<string> {
      return state.followedChannelsNames;
    },
    set followedChannelsNames(value: string[]) {
      state.followedChannelsNames = new Set(value);

      save();
    },
    get selectedChannelsNames() {
      return state.selectedChannelsNames;
    },
    get channelsByName() {
      return state.channelsByName;
    },
    get liveStreamsByChannelName(): Map<string, LiveStream> {
      return state.liveStreamsByChannelName;
    },
    set liveStreamsByChannelName(value: Record<string, LiveStream>) {
      state.liveStreamsByChannelName = new Map(Object.entries(value));

      save();
    },
    saveChannelByName,
    addSelectedChannelName,
    removeSelectedChannelName,
    removeAllSelectedChannelsNames,
    clear,
  };
}
