import { computed, inject, watchEffect } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useObservableState } from './useObservableState';
import { useAccount } from './useAccount';

export const useLibrary = createSharedComposable(() => {
  const library = inject(Injection.Module.Library);

  if (library === undefined) {
    throw new MissingModuleInjection(Injection.Module.Library);
  }

  const { state } = useObservableState(library.store);

  const { primaryAccount } = useAccount();

  // const usersById = computed(() => state.value.usersById);

  const liveStreams = computed(() => Object.values(state.value.liveStreamsByChannelName));

  const followedChannelsNames = computed(() => state.value.followedChannelsNames);

  const activeChannelsNames = computed(() => state.value.activeChannelsNames);

  const channelsByName = computed(() => state.value.channelsByName);

  /**
   * @todo Improve array forming and provide additional data (e.g. game name)
   */
  // const followedChannels = computed<Array<FollowedChannel & { isOnline?: boolean; category?: string }>>(() => {
  //   const onlineChannels = liveStreams.value.map((stream) => ({
  //     id: stream.channel.id,
  //     name: stream.channel.name,
  //     category: stream.category,
  //     isOnline: true,
  //     avatar: stream.channel.id in usersById.value ? usersById.value[stream.channel.id].avatar : undefined,
  //   }));

  //   const offlineChannels = state.value.followedChannels.filter((channel) => {
  //     return onlineChannels.findIndex((onlineChannelId) => channel.id === onlineChannelId.id);
  //   });

  //   return [
  //     ...onlineChannels,
  //     ...offlineChannels,
  //   ];
  // });

  watchEffect(() => {
    if (primaryAccount.value !== undefined) {
      /**
       * @todo Cache followed channels to reduce API calls
       */
      library?.requestFollowedChannelsNames(primaryAccount.value);
      library?.requestFollowedLiveStreams(primaryAccount.value);
    } else {
      library?.destroy();
    }
  });

  function activateChannel (name: string, isParallel = false): void {
    if (!isParallel) {
      deactivateAllChannels();
    }

    library?.activateChannel(name);
  }

  function deactivateChannel (name: string): void {
    library?.deactivateChannel(name);
  }

  function deactivateAllChannels (): void {
    library?.deactivateAllChannels();
  }

  function requestChannelByName (id: string): void {
    if (primaryAccount.value !== undefined) {
      library?.requestChannelByName(primaryAccount.value, id);
    }
  }

  return {
    liveStreams,
    channelsByName,
    followedChannelsNames,
    activeChannelsNames,
    activateChannel,
    deactivateChannel,
    deactivateAllChannels,
    requestChannelByName,
  };
});
