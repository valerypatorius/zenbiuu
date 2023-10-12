import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';
import type FollowedChannel from '@/entities/FollowedChannel';
import type UserEntity from '@/entities/UserEntity';

/**
 * Describes public properties and methods of a single provider
 */
export default interface ProviderApiInterface {
  connect: (token: string) => void;
  disconnect: () => void;
  login: () => Promise<AccountEntity>;
  logout: (token: string) => Promise<void>;
  getFollowedChannelsByUserId: (id: string) => Promise<FollowedChannel[]>;
  getFollowedStreamsByUserId: (id: string) => Promise<LiveStream[]>;
  getUsersByIds: (ids: string[]) => Promise<UserEntity[]>;
}
