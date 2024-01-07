import type AccountEntity from '@/entities/AccountEntity';
import type ChannelEntity from '@/entities/ChannelEntity';
import type LiveStream from '@/entities/LiveStream';

export interface ModuleLibraryStoreSchema {
  followedChannelsNames: string[];
  activeChannelsNames: string[];
  liveStreamsByChannelName: Record<string, LiveStream>;
  channelsByName: Record<string, ChannelEntity>;
}

export interface ModuleLibrary {
  requestFollowedChannelsNames: (account: AccountEntity) => Promise<void>;
  requestFollowedLiveStreams: (account: AccountEntity) => Promise<void>;
  requestChannelByName: (account: AccountEntity, name: string) => Promise<void>;
  getChannelPlaylistUrl: (account: AccountEntity, name: string) => Promise<string | undefined>;
  activateChannel: (name: string) => void;
  deactivateChannel: (name: string) => void;
  deactivateAllChannels: () => void;
  destroy: () => void;
  getLiveStreamsByChannelName: () => Record<string, LiveStream>;
  getChannelsByNames: () => Record<string, ChannelEntity>;
  getActiveChannelsNames: () => string[];
  getFollowedChannelsNames: () => string[];
}
