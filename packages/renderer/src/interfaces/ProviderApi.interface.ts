import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';

/**
 * Describes public properties and methods of a single provider
 */
export default interface ProviderApiInterface {
  connect: (token: string) => void;
  disconnect: () => void;
  login: () => Promise<AccountEntity>;
  logout: (token: string) => Promise<void>;
  getFollowedChannelsNamesByUserId: (id: string) => Promise<string[]>;
  getFollowedStreamsByUserId: (id: string) => Promise<LiveStream[]>;
  getChannelsByNames: (names: string[]) => Promise<ChannelEntity[]>;
}
