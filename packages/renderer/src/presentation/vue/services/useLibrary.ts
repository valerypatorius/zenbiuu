import { computed, inject, watchEffect } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { Injection } from '../injections';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { useAccount } from './useAccount';
import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';
import { createInterval } from '@/interval/index';
import date from '@/utils/date';

interface LibraryChannel {
  name: string;
  data?: ChannelEntity;
  stream?: LiveStream;
  isLive: boolean;
  isOpened: boolean;
}

export const useLibrary = createSharedComposable(() => {
  const library = inject(Injection.Module.Library);

  if (library === undefined) {
    throw new MissingModuleInjection(Injection.Module.Library);
  }

  const { primaryAccount } = useAccount();

  /**
   * @todo Find a better way of sorting?
   */
  // const followedChannelsNames = computed(() => {
  //   return [...library.store.followedChannelsNames.values()].sort((a, b) => {
  //     const indexA = liveStreams.value.findIndex((stream) => stream.channelName === a);
  //     const indexB = liveStreams.value.findIndex((stream) => stream.channelName === b);

  //     return (indexA >= 0 ? indexA : Infinity) - (indexB >= 0 ? indexB : Infinity);
  //   });
  // });

  const channels = computed<LibraryChannel[]>(() => {
    return [...library.store.followedChannelsNames.values()].map((name) => {
      return {
        name,
        data: library.store.channelsByName.get(name),
        stream: library.store.liveStreamsByChannelName.get(name),
        isLive: library.store.liveStreamsByChannelName.has(name),
        isOpened: library.store.selectedChannelsNames.has(name),
      };
    });
  });

  const liveChannels = computed(() => {
    return channels.value.filter((channel) => channel.isLive) as Array<
      LibraryChannel & { isLive: true; stream: LiveStream }
    >;
  });

  const openedChannels = computed(() => {
    return channels.value.filter((channel) => channel.isOpened) as Array<LibraryChannel & { isOpened: true }>;
  });

  let stopLibraryUpdates: (() => void) | undefined;

  watchEffect(() => {
    library.primaryAccount = primaryAccount.value;

    if (library.primaryAccount !== null) {
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

  function openChannel(name: string, isParallel = false): void {
    if (!isParallel) {
      closeAllChannels();
    }

    library?.store.addSelectedChannelName(name);
  }

  function closeChannel(name: string): void {
    void stopStream(name);

    library?.store.removeSelectedChannelName(name);
  }

  function closeAllChannels(): void {
    library?.store.selectedChannelsNames.forEach((name) => {
      void stopStream(name);
    });

    library?.store.removeAllSelectedChannelsNames();
  }

  function requestChannelByName(name: string): void {
    library?.requestChannelByName(name);
  }

  async function playStream(name: string, stream?: LiveStream): Promise<string | undefined> {
    return library?.playStream(name, stream);
  }

  async function stopStream(name: string): Promise<void> {
    await library?.stopStream(name);
  }

  return {
    channels,
    liveChannels,
    openedChannels,
    openChannel,
    closeChannel,
    closeAllChannels,
    requestChannelByName,
    playStream,
    stopStream,
  };
});
