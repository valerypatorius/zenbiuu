import { computed, inject, watchEffect } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useAccount } from './useAccount';
import type ChannelEntity from '@/entities/ChannelEntity';
import type LiveStream from '@/entities/LiveStream';
import { createInterval } from '@/interval/index';
import date from '@/utils/date';

export const useLibrary = createSharedComposable(() => {
  const library = inject(Injection.Module.Library);

  if (library === undefined) {
    throw new MissingModuleInjection(Injection.Module.Library);
  }

  const { primaryAccount } = useAccount();

  const liveStreams = computed(() => [...library.store.liveStreamsByChannelName.values()]);

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

  const openedChannels = computed(() => {
    return [...library.store.selectedChannelsNames.values()]
      .map((name) => library.store.channelsByName.get(name))
      .filter((channel) => channel !== undefined) as ChannelEntity[];
  });

  let stopLibraryUpdates: (() => void) | undefined;

  watchEffect(() => {
    library.primaryAccount = primaryAccount.value;

    if (primaryAccount.value !== undefined) {
      /**
       * @todo Cache followed channels to reduce API calls
       */
      library.requestFollowedChannelsNames();
      library.requestFollowedLiveStreams();

      stopLibraryUpdates?.();
      stopLibraryUpdates = createInterval(library.requestFollowedLiveStreams, date.Minute * 2);
    } else {
      stopLibraryUpdates?.();

      library.destroy();
    }
  });

  function openChannel (name: string, isParallel = false): void {
    if (!isParallel) {
      closeAllChannels();
    }

    library?.store.addSelectedChannelName(name);
  }

  function closeChannel (name: string): void {
    void stopStream(name);

    library?.store.removeSelectedChannelName(name);
  }

  function closeAllChannels (): void {
    library?.store.selectedChannelsNames.forEach((name) => {
      void stopStream(name);
    });

    library?.store.removeAllSelectedChannelsNames();
  }

  function requestChannelByName (name: string): void {
    library?.requestChannelByName(name);
  }

  async function playStream (name: string, stream?: LiveStream): Promise<string | undefined> {
    return library?.playStream(name, stream);
  }

  async function stopStream (name: string): Promise<void> {
    await library?.stopStream(name);
  }

  return {
    liveStreams,
    liveStreamsByChannelName: library.store.liveStreamsByChannelName,
    channelsByName: library.store.channelsByName,
    followedChannelsNames,
    openedChannels,
    openChannel,
    closeChannel,
    closeAllChannels,
    requestChannelByName,
    playStream,
    stopStream,
  };
});
