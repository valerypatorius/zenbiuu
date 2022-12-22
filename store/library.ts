import { Sorting, StreamType, TwitchStream, TwitchUser, TwitchUserFollow } from '../types/renderer/library';

export interface LibraryStoreSchema {
  /** Active library sorting */
  sorting: Sorting;

  /** Followed channels' data */
  followed: TwitchUserFollow[];

  /** Streams' data list */
  streams: {
    /** Followed streams' data */
    [StreamType.Followed]: TwitchStream[];

    /** Found in search streams' data */
    [StreamType.Found]: TwitchStream[];
  };

  /** Followed users' data */
  users: TwitchUser[];

  /** Last time of library update */
  lastUpdateTime: number;

  /** True, if library is ready for display */
  isReady: boolean;
}

export const LibraryStoreName = 'library';

export const defaultLibraryState: LibraryStoreSchema = {
  sorting: Sorting.ViewersDesc,
  followed: [],
  streams: {
    [StreamType.Followed]: [],
    [StreamType.Found]: [],
  },
  users: [],
  lastUpdateTime: 0,
  isReady: false,
};
