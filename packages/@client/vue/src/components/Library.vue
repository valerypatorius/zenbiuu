<template>
  <div :class="['library', isSidebarEnabled && 'library--with-sidebar']">
    <Sidebar
      v-if="isSidebarEnabled"
    />

    <div
      v-if="openedChannels.length > 0"
      class="library__playing"
    >
      <StreamView
        v-for="(channel, index) in openedChannels"
        :key="channel.name"
        :channel-name="channel.name"
        :channel="channel.data"
        :stream="channel.stream"
        :playlist="channel.isLive ? playStream : undefined"
        :is-main="index === 0"
      />
    </div>

    <div
      v-else-if="liveChannels.length > 0"
      class="library__main"
    >
      <Scrollable>
        <div class="library__grid">
          <LibraryItem
            v-for="channel in liveChannels"
            :key="channel.name"
            :stream="channel.stream"
            :name="channel.name"
            :avatar="channel.data?.avatar"
            @click="openChannel(channel.name)"
          />
        </div>
      </Scrollable>
    </div>

    <div
      v-else
      class="library__empty"
    >
      <img :src="appIconPath" />
    </div>
  </div>
</template>

<script setup lang="ts">
import appIconPath from '~/assets/art.svg';
import { useLibrary } from '~/services/useLibrary';
import LibraryItem from './LibraryItem.vue';
import StreamView from './StreamView.vue';
import Scrollable from './ui/Scrollable.vue';
import Sidebar from './Sidebar.vue';
import { useSettings } from '~/services/useSettings';

const { liveChannels, openedChannels, openChannel, playStream } = useLibrary();
const { isSidebarEnabled } = useSettings();
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.library {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;

  &--with-sidebar {
    grid-template-columns: var(--layout-left-sidebar-width) 1fr;
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
    gap: 2px;
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
