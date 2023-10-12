<template>
  <div class="library">
    <aside class="scrollable library__channels">
      <Button
        class="library__reset"
        @click="deactivateAllChannels()"
      >
        {{ t('library') }}
      </Button>

      <div
        v-for="channel in followedChannels"
        :key="channel.id"
        :class="[
          'library__channel',
          channel.isOnline === true && 'library__channel--online',
        ]"
        @click="activateChannel(channel.id)"
      >
        <Avatar
          :src="channel.avatar"
          :size="28"
        />

        <div class="library__channel__name">
          {{ channel.name }}
        </div>

        <div
          class="library__channel__split"
          @click.stop="activateChannel(channel.id, true)"
        >
          <Icon
            name="gridAdd"
            :size="20"
          />
        </div>
      </div>
    </aside>

    <div
      v-if="activeChannelsIds.length > 0"
      class="library__playing"
    >
      <Channel
        v-for="channelId in activeChannelsIds"
        :key="channelId"
        :cover="liveStreams.find((stream) => stream.channel.id === channelId)?.cover"
        @close="deactivateChannel(channelId)"
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
        @click="activateChannel(stream.channel.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLibrary } from '../services/useLibrary';
import LibraryItem from './LibraryItem.vue';
import Avatar from './ui/Avatar.vue';
import Channel from './Channel.vue';
import Button from './ui/Button.vue';
import Icon from './ui/Icon.vue';

const {
  liveStreams,
  followedChannels,
  activeChannelsIds,
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
  }

  &__channel {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--theme-color-text-secondary);
    cursor: pointer;
    padding-left: 12px;

    &--online {
      color: var(--theme-color-text);
    }

    &__name {
      flex-grow: 1;
      padding: 8px 0;
    }

    &__category {
      @extend %text-small;
      color: var(--theme-color-text-secondary);
    }

    &__split {
      align-self: stretch;
      display: flex;
      align-items: center;
      color: var(--theme-color-text-tertiary);
      cursor: pointer;
      padding: 0 12px;

      &:hover {
        background-color: var(--theme-color-button-background);
        color: var(--theme-color-text);
      }
    }

    &:hover {
      .library__channel__name {
        color: var(--theme-color-text);
      }
    }
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
