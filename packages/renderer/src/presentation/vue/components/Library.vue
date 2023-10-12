<template>
  <div class="library">
    <aside class="scrollable library__channels">
      <Button
        class="library__reset"
        @click="deactivateAllChannels()"
      >
        {{ t('library') }}
      </Button>

      <Channel
        v-for="name in followedChannelsNames"
        :key="name"
        class="library__channel"
        :name="name"
        :is-interactable="true"
        @click="activateChannel(name)"
      >
        <IconButton
          icon="gridAdd"
          :size="20"
          @click="activateChannel(name, true)"
        />
      </Channel>
    </aside>

    <div
      v-if="activeChannelsNames.length > 0"
      class="library__playing"
    >
      <Stream
        v-for="name in activeChannelsNames"
        :key="name"
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
        @click="activateChannel(stream.channelName)"
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
import Channel from './Channel.vue';

const {
  liveStreams,
  followedChannelsNames,
  activeChannelsNames,
  activateChannel,
  deactivateChannel,
  deactivateAllChannels,
} = useLibrary();

const { t } = useI18n();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.library {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 100%;

  &__channels {
    display: grid;
    align-content: start;
    padding-top: 12px;
  }

  &__channel {
    color: var(--theme-color-text-secondary);
    padding: 6px 12px;
  }

  &__main {
    --size-offset: 60px;
    --size-grid: 300px;

    display: grid;
    gap: var(--size-offset) calc(var(--size-offset) * 1.2);
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
  }
}
</style>
