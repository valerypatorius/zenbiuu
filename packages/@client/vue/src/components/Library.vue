<template>
  <div :class="['library', isSidebarEnabled && 'library--with-sidebar']">
    <aside
      v-show="isSidebarEnabled"
      class="library__sidebar"
    >
      <Scrollable>
        <div class="library__channels">
          <div
            v-for="{ name, data, stream, isLive, isOpened } in channels"
            :key="name"
            :class="['library__channel', isOpened && 'library__channel--active']"
            @click="openChannel(name)"
          >
            <ChannelCard
              :name="name"
              :details="stream?.category ?? (!isCompactLayout ? data?.description : undefined)"
              :avatar="data?.avatar"
              :is-live="isLive"
            />

            <!-- <IconButton
              icon="plus"
              :size="16"
              @click.stop="openChannel(name, true)"
            /> -->
          </div>
        </div>
      </Scrollable>
    </aside>

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
        @close="closeChannel(channel.name)"
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
import ChannelCard from './ChannelCard.vue';
import LibraryItem from './LibraryItem.vue';
import StreamView from './StreamView.vue';
import IconButton from './ui/IconButton.vue';
import Scrollable from './ui/Scrollable.vue';
import { useSettings } from '~/services/useSettings';

const { channels, liveChannels, openedChannels, openChannel, closeChannel, playStream } = useLibrary();

const { isCompactLayout, isSidebarEnabled } = useSettings();
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

  &__sidebar {
    display: grid;
    background-color: rgba(0, 0, 0, 0.1);
    padding-top: var(--layout-titlebar-height);
  }

  &__channels {
    padding: 6px 6px 12px 6px;
  }

  &__channel {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 8px 12px;
    border-radius: 12px;
    cursor: pointer;

    &:not(:last-child) {
      margin-bottom: 1px;
    }

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

    .icon-button {
      flex-shrink: 0;
      margin-left: auto;
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
