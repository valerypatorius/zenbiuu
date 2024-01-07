import { type ModuleLibraryStoreSchema } from './types';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';
import type ChannelEntity from '@/entities/ChannelEntity';
import type LiveStream from '@/entities/LiveStream';
import { clearArray, removeFromArray } from '@/utils/array';
import { clearObject } from '@/utils/object';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function createLibraryStore (createState: ModuleStateFactoryFn<ModuleLibraryStoreSchema>) {
  const { state, save } = await createState('store:library', {
    followedChannelsNames: [],
    activeChannelsNames: [],
    liveStreamsByChannelName: {},
    channelsByName: {},
  });

  function getFollowedChannelsNames (): string[] {
    return state.followedChannelsNames;
  }

  function setFollowedChannelsNames (value: string[]): void {
    state.followedChannelsNames = value;

    save();
  }

  function setLiveStreamsByChannelName (value: Record<string, LiveStream>): void {
    state.liveStreamsByChannelName = value;

    save();
  }

  function getChannelsByName (): Record<string, ChannelEntity> {
    return state.channelsByName;
  }

  function getLiveStreamsByChannelName (): Record<string, LiveStream> {
    return state.liveStreamsByChannelName;
  }

  function addChannelByName (name: string, channel: ChannelEntity): void {
    state.channelsByName[name] = channel;

    save();
  }

  function getActiveChannelsNames (): string[] {
    return state.activeChannelsNames;
  }

  function addActiveChannelName (name: string): void {
    removeFromArray(state.activeChannelsNames, name);
    state.activeChannelsNames.push(name);

    save();
  }

  function removeActiveChannelName (name: string): void {
    removeFromArray(state.activeChannelsNames, name);

    save();
  }

  function clearActiveChannelNames (): void {
    clearArray(state.activeChannelsNames);

    save();
  }

  function clear (): void {
    clearArray(state.followedChannelsNames);
    clearArray(state.activeChannelsNames);

    clearObject(state.liveStreamsByChannelName);
    clearObject(state.channelsByName);

    save();
  }

  return {
    getFollowedChannelsNames,
    setFollowedChannelsNames,
    setLiveStreamsByChannelName,
    getChannelsByName,
    getLiveStreamsByChannelName,
    addChannelByName,
    getActiveChannelsNames,
    addActiveChannelName,
    removeActiveChannelName,
    clearActiveChannelNames,
    clear,
  };
}
