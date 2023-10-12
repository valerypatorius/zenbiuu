import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';
import ObservableStore from '@/modules/shared/ObservableStore';
import { statefulArray } from '@/utils/array';
import { statefulObject } from '@/utils/object';

interface Schema {
  followedChannelsNames: string[];
  activeChannelsNames: string[];
  liveStreamsByChannelName: Record<string, LiveStream>;
  channelsByName: Record<string, ChannelEntity>;
}

export default class LibraryStore extends ObservableStore<Schema> {
  static async build (): Promise<LibraryStore> {
    const { name, data } = await LibraryStore.prepare<Schema>('store:library', {
      followedChannelsNames: [],
      activeChannelsNames: [],
      liveStreamsByChannelName: {},
      channelsByName: {},
    });

    return new LibraryStore(name, data);
  }

  public readonly followedChannelsNames = statefulArray(this.stateProxy.followedChannelsNames);

  public readonly activeChannelsNames = statefulArray(this.stateProxy.activeChannelsNames);

  public readonly liveStreamsByChannelName = statefulObject(this.stateProxy.liveStreamsByChannelName);

  public readonly channelsByName = statefulObject(this.stateProxy.channelsByName);

  public clear (): void {
    this.followedChannelsNames.clear();
    this.activeChannelsNames.clear();
    this.liveStreamsByChannelName.clear();
    this.channelsByName.clear();
  }
}
