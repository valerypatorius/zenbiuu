import { computed, inject, watchEffect } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useObservableState } from './useObservableState';
import { useAccount } from './useAccount';
import type FollowedChannel from '@/entities/FollowedChannel';
import type LiveStream from '@/entities/LiveStream';

export const useLibrary = createSharedComposable(() => {
  const library = inject(Injection.Module.Library);

  if (library === undefined) {
    throw new MissingModuleInjection(Injection.Module.Library);
  }

  const { state } = useObservableState(library.store);

  const { primaryAccount } = useAccount();

  const usersById = computed(() => state.value.usersById);

  const liveStreams = computed<LiveStream[]>(() => state.value.liveStreams.map((stream) => {
    return {
      ...stream,
      channel: {
        ...stream.channel,
        avatar: stream.channel.id in usersById.value ? usersById.value[stream.channel.id].avatar : undefined,
      },
    };
  }));

  const activeChannelsIds = computed(() => state.value.activeChannelsIds);

  /**
   * @todo Improve array forming and provide additional data (e.g. game name)
   */
  const followedChannels = computed<Array<FollowedChannel & { isOnline?: boolean; category?: string }>>(() => {
    const onlineChannels = liveStreams.value.map((stream) => ({
      id: stream.channel.id,
      name: stream.channel.name,
      category: stream.category,
      isOnline: true,
      avatar: stream.channel.id in usersById.value ? usersById.value[stream.channel.id].avatar : undefined,
    }));

    const offlineChannels = state.value.followedChannels.filter((channel) => {
      return onlineChannels.findIndex((onlineChannelId) => channel.id === onlineChannelId.id);
    });

    return [
      ...onlineChannels,
      ...offlineChannels,
    ];
  });

  watchEffect(() => {
    if (primaryAccount.value !== undefined) {
      /**
       * @todo Cache followed channels to reduce API calls
       */
      library?.getFollowedChannels(primaryAccount.value);
      library?.getFollowedLiveStreams(primaryAccount.value).then(() => {
        if (primaryAccount.value !== undefined) {
          library?.getUsersByIds(primaryAccount.value, liveStreams.value.map((stream) => stream.channel.id));
        }
      });
    } else {
      library?.clear();
    }
  });

  function activateChannel (id: string, isParallel = false): void {
    if (!isParallel) {
      deactivateAllChannels();
    }

    library?.activateChannel(id);
  }

  function deactivateChannel (id: string): void {
    library?.deactivateChannel(id);
  }

  function deactivateAllChannels (): void {
    library?.deactivateAllChannels();
  }

  return {
    liveStreams,
    followedChannels,
    activeChannelsIds,
    usersById,
    activateChannel,
    deactivateChannel,
    deactivateAllChannels,
  };
});
