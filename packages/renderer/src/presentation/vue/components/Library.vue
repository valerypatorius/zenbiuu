<template>
  <div class="library">
    <aside class="scrollable library__channels">
      <Button
        class="library__reset"
        type="secondary"
        @click="deactivateAllChannels()"
      >
        {{ t('library') }}
      </Button>

      <ChannelCard
        v-for="name in followedChannelsNames"
        :key="name"
        :class="[
          'library__channel',
          activeChannelsNames.includes(name) && 'library__channel--active',
        ]"
        :name="name"
        :category="liveStreamsByChannelName[name]?.category"
        :data="channelsByName[name]"
        :is-live="name in liveStreamsByChannelName"
        :is-interactable="true"
        @click="activateChannel(name)"
        @visible="requestChannelByName(name)"
      >
        <div class="library__actions">
          <IconButton
            :icon="activeChannelsNames.includes(name) ? 'playFilled' : 'gridAdd'"
            :size="18"
            :disabled="activeChannelsNames.includes(name)"
            @click="activateChannel(name, true)"
          />
        </div>
      </ChannelCard>
    </aside>

    <div
      v-if="activeChannelsNames.length > 0"
      class="library__playing"
    >
      <Stream
        v-for="name in activeChannelsNames"
        :key="name"
        :channel-name="name"
        :playlist="getChannelPlaylistUrl"
        :cover="liveStreamsByChannelName[name]?.cover ?? channelsByName[name]?.offlineCover"
        @close="deactivateChannel(name)"
      />
    </div>

    <div
      v-else
      class="scrollable library__main"
    >
      <LibraryItem
        v-for="stream in liveStreams"
        :key="stream.id"
        v-bind="stream"
        :channel="channelsByName[stream.channelName]"
        @click="activateChannel(stream.channelName)"
        @channel-visible="requestChannelByName(stream.channelName)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLibrary } from '../services/useLibrary';
import LibraryItem from './LibraryItem.vue';
import Stream from './Stream.vue';
import Button from './ui/Button.vue';
import IconButton from './ui/IconButton.vue';
import ChannelCard from './ChannelCard.vue';

const {
  liveStreams,
  liveStreamsByChannelName,
  channelsByName,
  followedChannelsNames,
  activeChannelsNames,
  activateChannel,
  deactivateChannel,
  deactivateAllChannels,
  requestChannelByName,
  getChannelPlaylistUrl,
} = useLibrary();

const { t } = useI18n();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.library {
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: 100%;

  &__channels {
    display: grid;
    align-content: start;
    padding: 12px 6px;
    gap: 2px;
  }

  &__channel {
    border-radius: 12px;
    padding: 6px;
    color: var(--theme-color-text-secondary);
    cursor: pointer;

    &:hover {
      color: var(--theme-color-text);
    }

    &--active {
      color: var(--theme-color-text);
      pointer-events: none;
    }

    /* &--active {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.03);
    } */
  }

  &__actions {
    align-self: center;
    display: flex;
    gap: 8px;
    color: var(--theme-color-text-tertiary);

    /* &:hover {
      color: var(--theme-color-text);
    } */
  }

  &__main {
    --size-offset: 30px;
    --size-grid: 360px;

    display: grid;
    /* gap: var(--size-offset) calc(var(--size-offset) * 1.75); */
    gap: 20px;
    align-content: start;
    grid-template-columns: repeat(auto-fill, minmax(var(--size-grid), 1fr));
    padding: 12px 30px;
  }

  &__playing {
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
    gap: 4px;
  }

  &__reset {
    justify-self: center;
    position: sticky;
    top: 0;
    left: 12px;
    margin-bottom: 12px;
    z-index: 1;
  }
}
</style>
