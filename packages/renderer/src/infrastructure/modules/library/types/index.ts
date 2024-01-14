import type AccountEntity from '@/entities/AccountEntity';
import type ChannelEntity from '@/entities/ChannelEntity';
import type LiveStream from '@/entities/LiveStream';

export interface ModuleLibraryStoreSchema {
  followedChannelsNames: Set<string>;
  selectedChannelsNames: Set<string>;
  channelsByName: Map<string, ChannelEntity>;
  liveStreamsByChannelName: Map<string, LiveStream>;
}

export interface ModuleLibraryStore {
  get followedChannelsNames(): Set<string>;
  set followedChannelsNames(value: string[]);
  readonly selectedChannelsNames: Set<string>;
  readonly channelsByName: Map<string, ChannelEntity>;
  get liveStreamsByChannelName(): Map<string, LiveStream>;
  set liveStreamsByChannelName(value: Record<string, LiveStream>);
  saveChannelByName: (name: string, channel: ChannelEntity) => void;
  addSelectedChannelName: (name: string) => void;
  removeSelectedChannelName: (name: string) => void;
  removeAllSelectedChannelsNames: () => void;
  clear: () => void;
}

export interface ModuleLibrary {
  readonly store: ModuleLibraryStore;
  primaryAccount: AccountEntity | undefined;
  requestFollowedChannelsNames: () => Promise<void>;
  requestFollowedLiveStreams: () => Promise<void>;
  requestChannelByName: (name: string) => Promise<void>;
  getChannelPlaylistUrl: (name: string) => Promise<string | undefined>;
  destroy: () => void;
}
