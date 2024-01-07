<template>
  <div
    :class="[
      'library',
      isSidebarActive && 'library--with-sidebar',
    ]"
  >
    <aside
      v-show="isSidebarActive"
      class="library__sidebar"
    >
      <Scrollable>
        <div class="library__channels">
          <ChannelCard
            v-for="name in followedChannelsNames"
            :key="name"
            :class="[
              'library__channel',
              activeChannels.find((channel) => channel.name === name) && 'library__channel--active',
            ]"
            :name="name"
            :category="liveStreamsByChannelName[name]?.category"
            :data="channelsByName[name]"
            :is-live="name in liveStreamsByChannelName"
            @click="activateChannel(name)"
            @visible="requestChannelByName(name)"
          />
        </div>
      </Scrollable>
    </aside>

    <div
      v-if="activeChannels.length > 0"
      class="library__playing"
    >
      <Stream
        v-for="{ name, id, offlineCover } in activeChannels"
        :key="name"
        :channel-name="name"
        :channel-id="id"
        :playlist="name in liveStreamsByChannelName ? getChannelPlaylistUrl : undefined"
        :cover="liveStreamsByChannelName[name]?.cover ?? offlineCover"
        @close="deactivateChannel(name)"
      />
    </div>

    <div
      v-else-if="liveStreams.length > 0"
      class="library__main"
    >
      <Scrollable>
        <div class="library__grid">
          <LibraryItem
            v-for="stream in liveStreams"
            :key="stream.id"
            v-bind="stream"
            :channel="channelsByName[stream.channelName]"
            @click="activateChannel(stream.channelName)"
            @channel-visible="requestChannelByName(stream.channelName)"
          />
        </div>
      </Scrollable>
    </div>

    <div
      v-else
      class="library__empty"
    >
      <img
        :src="appIconPath"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLibrary } from '../services/useLibrary';
import LibraryItem from './LibraryItem.vue';
import Stream from './Stream.vue';
import ChannelCard from './ChannelCard.vue';
import Scrollable from './ui/Scrollable.vue';
import appIconPath from '@/assets/icon.svg';

defineProps<{
  isSidebarActive?: boolean;
}>();

const {
  liveStreams,
  liveStreamsByChannelName,
  channelsByName,
  followedChannelsNames,
  activeChannels,
  activateChannel,
  deactivateChannel,
  requestChannelByName,
  getChannelPlaylistUrl,
} = useLibrary();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.library {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;

  &--with-sidebar {
    grid-template-columns: var(--layout-left-sidebar-width) 1fr;
  }

  &__sidebar {
    display: grid;
    background-color: rgba(0, 0, 0, 0.1);
    padding-top: var(--layout-titlebar-height);
  }

  &__channels {
    padding: 6px 0 12px 6px;
  }

  &__channel {
    border-radius: 12px;
    padding: 8px 12px;
    color: var(--theme-color-text-secondary);
    cursor: pointer;
    background-image: var(--background-image);

    &:hover {
      background-color: var(--theme-color-background);
    }

    &--active {
      pointer-events: none;
      background-color: var(--theme-color-background);
      position: sticky;
      top: 0;
      bottom: 0;
      z-index: 2;
    }
  }

  &__main {
    display: grid;
    padding-top: var(--layout-titlebar-height);
  }

  &__grid {
    display: grid;
    gap: 44px;
    align-content: start;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    padding: 6px 36px 12px;
  }

  &__playing {
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
  }

  &__empty {
    display: grid;
    align-content: center;
    justify-content: center;
    grid-template-columns: minmax(0, 300px);

    img {
      width: 100%;
      filter: grayscale(1);
      opacity: 0.1;
    }
  }
}
</style>
