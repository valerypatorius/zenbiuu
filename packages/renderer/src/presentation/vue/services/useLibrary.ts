import { computed, inject, watchEffect } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useAccount } from './useAccount';
import type ChannelEntity from '@/entities/ChannelEntity';

export const useLibrary = createSharedComposable(() => {
  const library = inject(Injection.Module.Library);

  if (library === undefined) {
    throw new MissingModuleInjection(Injection.Module.Library);
  }

  const { primaryAccount } = useAccount();

  const liveStreamsByChannelName = computed(() => library.store.liveStreamsByChannelName);

  const liveStreams = computed(() => [...liveStreamsByChannelName.value.values()]);

  /**
   * @todo Find a better way of sorting?
   */
  const followedChannelsNames = computed(() => {
    return [...library.store.followedChannelsNames.values()].sort((a, b) => {
      const indexA = liveStreams.value.findIndex((stream) => stream.channelName === a);
      const indexB = liveStreams.value.findIndex((stream) => stream.channelName === b);

      return (indexA >= 0 ? indexA : Infinity) - (indexB >= 0 ? indexB : Infinity);
    });
  });

  const channelsByName = computed(() => library.store.channelsByName);

  const openedChannels = computed(() => {
    return [...library.store.selectedChannelsNames.values()]
      .map((name) => channelsByName.value.get(name))
      .filter((channel) => channel !== undefined) as ChannelEntity[];
  });

  watchEffect(() => {
    library.primaryAccount = primaryAccount.value;

    if (primaryAccount.value !== undefined) {
      /**
       * @todo Cache followed channels to reduce API calls
       */
      library?.requestFollowedChannelsNames();
      library?.requestFollowedLiveStreams();
    } else {
      library?.destroy();
    }
  });

  function openChannel (name: string, isParallel = false): void {
    if (!isParallel) {
      closeAllChannels();
    }

    library?.store.addSelectedChannelName(name);
  }

  function closeChannel (name: string): void {
    library?.store.removeSelectedChannelName(name);
  }

  function closeAllChannels (): void {
    library?.store.removeAllSelectedChannelsNames();
  }

  function requestChannelByName (name: string): void {
    library?.requestChannelByName(name);
  }

  async function getChannelPlaylistUrl (name: string): Promise<string | undefined> {
    return library?.getChannelPlaylistUrl(name);
  }

  return {
    liveStreams,
    liveStreamsByChannelName,
    channelsByName,
    followedChannelsNames,
    openedChannels,
    openChannel,
    closeChannel,
    closeAllChannels,
    requestChannelByName,
    getChannelPlaylistUrl,
  };
});
