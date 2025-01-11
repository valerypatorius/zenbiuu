<template>
  <div :class="['library', isSidebarEnabled && 'library--with-sidebar']">
    <aside
      v-show="isSidebarEnabled"
      class="library__sidebar"
    >
      <div class="library__search">
        <TextInput
          icon="search"
          :placeholder="t('search')"
          @update:value="(value) => {
            searchQuery = value;
          }"
        />
      </div>

      <Scrollable>
        <div class="library__channels">
          <div
            v-for="{ name, data, stream, isLive, isOpened } in channels.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))"
            :key="name"
            :class="[
              'library-channel',
              isOpened && 'library-channel--active',
              isCompactLayout && 'library-channel--compact'
            ]"
            :style="{
              '--opened-channel-index': openedChannels.findIndex((channel) => channel.name === name),
            }"
            @click="openChannel(name)"
          >
            <div class="library-channel__main">
              <ChannelCard
                :name="name"
                :details="stream?.category ?? (!isCompactLayout ? 'Offline' : undefined)"
                :avatar="data?.avatar"
                :is-live="isLive"
              />
            </div>

            <div
              v-if="isOpened"
              class="library-channel__action"
              @click.stop="closeChannel(name)"
            >
              <Icon name="close" :size="15" />
            </div>

            <div
              v-else-if="openedChannels.length > 0"
              class="library-channel__action"
              @click.stop="openChannel(name, true)"
            >
              <Icon name="playlistAdd" :size="20" />
            </div>
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
import Scrollable from './ui/Scrollable.vue';
import TextInput from './ui/TextInput';
import { useSettings } from '~/services/useSettings';
import Icon from './ui/Icon';
import { useI18n } from 'vue-i18n';

const { channels, liveChannels, openedChannels, searchQuery, openChannel, closeChannel, playStream } = useLibrary();
const { isCompactLayout, isSidebarEnabled } = useSettings();
const { t } = useI18n();
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
    grid-template-rows: auto 1fr;
    background-color: var(--theme-color-background-sidebar);
    padding-top: calc(var(--layout-titlebar-height) + 6px);
  }

  &__channels {
    padding: 0 6px 6px 6px;
  }

  &-channel {
    display: grid;
    grid-template-columns: 1fr auto;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    margin-bottom: 1px;

    &:hover {
      background-color: var(--theme-color-background);

      .library-channel__action {
        display: flex;
      }
    }

    &--active {
      pointer-events: none;
      background-color: var(--theme-color-background);
      position: sticky;
      top: calc(var(--opened-channel-index, 0) * 41px);
      bottom: 0;
      z-index: 2;
      box-shadow: 0 1px 0 0 var(--theme-color-background-sidebar);

      .library-channel__action {
        display: flex;
      }
    }

    &--compact {
      .library-channel__main {
        padding: 8px 12px;
      }

      .library-channel__action {
        padding: 0 12px;
      }
    }

    &__main {
      padding: 4px 12px;
    }

    &__action {
      color: var(--theme-color-text-tertiary);
      align-items: center;
      justify-content: center;
      width: 42px;
      /* padding: 0 16px; */
      display: none;
      pointer-events: auto;

      &:hover {
        background-color: rgba(255, 255, 255, 0.02);
        color: var(--theme-color-text-secondary);
      }
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

  &__search {
    height: 46px;
    padding: 0 6px 6px;
    background-color: var(--theme-color-background-sidebar);
    display: flex;

    .text-input {
      border-radius: 12px;
    }
  }
}
</style>
