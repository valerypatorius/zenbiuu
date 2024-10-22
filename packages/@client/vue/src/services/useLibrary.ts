import { createInterval } from '@client/interval';
import type { ChannelEntity, LiveStream } from '@client/shared';
import { createSharedComposable } from '@vueuse/core';
import { Minute } from '@zenbiuu/shared';
import { computed, inject, watchEffect } from 'vue';
import MissingModuleInjection from '../errors/MissingModuleInjection';
import { Injection } from '../injections';
import { useAccount } from './useAccount';

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

  const channels = computed<LibraryChannel[]>(() => {
    return [...library.store.followedChannelsNames.values()]
      .map((name) => {
        return {
          name,
          data: library.store.channelsByName.get(name),
          stream: library.store.liveStreamsByChannelName.get(name),
          isLive: library.store.liveStreamsByChannelName.has(name),
          isOpened: library.store.selectedChannelsNames.has(name),
        };
      })
      .sort((channelA, channelB) => {
        return (
          (channelB.stream?.viewersCount ?? 0) *
            (channelB.isLive === true ? 1 : 0) -
          (channelA.stream?.viewersCount ?? 0) *
            (channelA.isLive === true ? 1 : 0)
        );
      });
  });

  const liveChannels = computed(() => {
    return channels.value.filter(
      (channel) => channel.isLive,
    ) as (LibraryChannel & {
      isLive: true;
      stream: LiveStream;
    })[];
  });

  const openedChannels = computed(() => {
    return channels.value.filter(
      (channel) => channel.isOpened,
    ) as (LibraryChannel & { isOpened: true })[];
  });

  let stopLibraryUpdates: (() => void) | undefined;

  watchEffect(() => {
    library.primaryAccount = primaryAccount.value;

    if (library.primaryAccount !== null) {
      /**
       * @todo Cache followed channels to reduce API calls
       */
      void library.requestFollowedChannelsNames();
      void library.requestFollowedLiveStreams();

      stopLibraryUpdates?.();
      stopLibraryUpdates = createInterval(() => {
        void library.requestFollowedLiveStreams();
      }, Minute * 2);
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
    stopStream(name);

    library?.store.removeSelectedChannelName(name);
  }

  function closeAllChannels(): void {
    if (library?.store === undefined) {
      return;
    }

    for (const name of library.store.selectedChannelsNames) {
      stopStream(name);
    }

    library.store.removeAllSelectedChannelsNames();
  }

  function requestChannelByName(name: string): void {
    library?.requestChannelByName(name);
  }

  async function playStream(
    name: string,
    stream?: LiveStream,
  ): Promise<string | undefined> {
    return library?.playStream(name, stream);
  }

  function stopStream(name: string): void {
    library?.stopStream(name);
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
    getChannelVolume(name: string) {
      return library.store.getChannelVolume(name);
    },
    saveChannelVolume(name: string, value: number) {
      library.store.setChannelVolume(name, value);
    },
  };
});
