import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';
import type ChatMessage from '@/entities/ChatMessage';

/**
 * Describes public properties and methods of a single provider
 */
export default interface ProviderApiInterface {
  connect: (token: string, username: string) => void;
  disconnect: () => void;
  login: () => Promise<AccountEntity>;
  logout: (token: string) => Promise<void>;
  getFollowedChannelsNamesByUserId: (id: string) => Promise<string[]>;
  getFollowedStreamsByUserId: (id: string) => Promise<LiveStream[]>;
  getChannelsByNames: (names: string[]) => Promise<ChannelEntity[]>;
  getChannelPlaylistUrl: (name: string) => Promise<string | undefined>;
  joinChat: (channel: string, onMessage: (message: ChatMessage) => void) => void;
  leaveChat: (channel: string) => void;
  requestEmotesForChannelId: (id: string) => void;
}
