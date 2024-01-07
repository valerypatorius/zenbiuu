import { computed, inject, watchEffect } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useAccount } from './useAccount';

export const useLibrary = createSharedComposable(() => {
  const library = inject(Injection.Module.Library);

  if (library === undefined) {
    throw new MissingModuleInjection(Injection.Module.Library);
  }

  const { primaryAccount } = useAccount();

  const liveStreamsByChannelName = computed(() => library.getLiveStreamsByChannelName());

  const liveStreams = computed(() => Object.values(liveStreamsByChannelName.value));

  /**
   * @todo Find a better way of sorting?
   */
  const followedChannelsNames = computed(() => {
    return [...library.getFollowedChannelsNames()].sort((a, b) => {
      const indexA = liveStreams.value.findIndex((stream) => stream.channelName === a);
      const indexB = liveStreams.value.findIndex((stream) => stream.channelName === b);

      return (indexA >= 0 ? indexA : Infinity) - (indexB >= 0 ? indexB : Infinity);
    });
  });

  const channelsByName = computed(() => library.getChannelsByNames());

  const activeChannels = computed(() => library.getActiveChannelsNames().map((name) => channelsByName.value[name]));

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

  function requestChannelByName (name: string): void {
    if (primaryAccount.value !== undefined) {
      library?.requestChannelByName(primaryAccount.value, name);
    }
  }

  async function getChannelPlaylistUrl (name: string): Promise<string | undefined> {
    if (primaryAccount.value !== undefined) {
      return library?.getChannelPlaylistUrl(primaryAccount.value, name);
    }
  }

  return {
    liveStreams,
    liveStreamsByChannelName,
    channelsByName,
    followedChannelsNames,
    activeChannels,
    activateChannel,
    deactivateChannel,
    deactivateAllChannels,
    requestChannelByName,
    getChannelPlaylistUrl,
  };
});
