import type FollowedChannel from './FollowedChannel';

export default interface LiveStream {
  id: string;
  title: string;
  cover: string;
  category: string;
  channel: FollowedChannel;
  viewersCount: number;
  dateStarted: string;
}
