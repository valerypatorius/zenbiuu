import type LiveStream from '@/entities/LiveStream';
import type FollowedChannel from '@/entities/FollowedChannel';
import type UserEntity from '@/entities/UserEntity';
import ObservableStore from '@/modules/shared/ObservableStore';
import { clearArray, removeFromArray } from '@/utils/array';

/**
 * @todo Make dictionaries for channels ids
 */
interface Schema {
  followedChannels: FollowedChannel[];
  activeChannelsIds: string[];
  liveStreams: LiveStream[];
  usersById: Record<string, UserEntity>;
}

export default class LibraryStore extends ObservableStore<Schema> {
  static async build (): Promise<LibraryStore> {
    const { name, data } = await LibraryStore.prepare<Schema>('store:library', {
      followedChannels: [],
      activeChannelsIds: [],
      liveStreams: [],
      usersById: {},
    });

    return new LibraryStore(name, data);
  }

  public setFollowedChannels (value: FollowedChannel[]): void {
    this.stateProxy.followedChannels = value;
  }

  public setLiveStreams (value: LiveStream[]): void {
    this.stateProxy.liveStreams = value;
  }

  public addActiveChannelId (value: string): void {
    this.removeActiveChannelId(value);

    this.stateProxy.activeChannelsIds.push(value);
  }

  public removeActiveChannelId (id: string): void {
    removeFromArray(this.stateProxy.activeChannelsIds, id);
  }

  public clearActiveChannelIds (): void {
    clearArray(this.stateProxy.activeChannelsIds);
  }

  public clearAll (): void {
    this.clearActiveChannelIds();

    clearArray(this.stateProxy.followedChannels);
    clearArray(this.stateProxy.liveStreams);
  }

  public setUsers (value: UserEntity[]): void {
    value.forEach((user) => {
      this.stateProxy.usersById[user.id] = user;
    });
  }
}
