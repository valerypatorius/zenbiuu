import type {
  AccountEntity,
  ChannelEntity,
  ChatMessage,
  LiveStream,
} from '../entities';

/**
 * Describes public properties and methods of a single provider
 */
export interface ProviderApiInterface {
  connect: (account: AccountEntity) => void;
  disconnect: () => void;

  login: () => Promise<AccountEntity>;
  logout: (token: string) => Promise<void>;

  getFollowedChannelsNamesByUserId: (id: string) => Promise<string[]>;
  getFollowedStreamsByUserId: (id: string) => Promise<LiveStream[]>;
  getChannelsByNames: (names: string[]) => Promise<ChannelEntity[]>;

  playStream: (
    channelName: string,
    stream?: LiveStream,
  ) => Promise<string | undefined>;
  stopStream: (channelName: string) => void;

  joinChat: (
    channel: string,
    onMessage: (message: ChatMessage) => void,
  ) => void;
  leaveChat: (channel: string) => void;

  requestEmotesForChannelId: (id: string) => void;
}
