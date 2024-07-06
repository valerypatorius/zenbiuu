<template>
  <div class="video-overlay">
    <div
      v-if="stream"
      class="video-overlay__header"
    >
      <!-- <IconButton
        icon="chevronLeft"
        :size="24"
      /> -->

      <div class="video-overlay__category">
        {{ stream.category }}
      </div>

      <div class="video-overlay__title">
        {{ stream.title }}
      </div>

      <div class="video-overlay__stats">
        <div class="video-overlay__stat">
          <Icon
            name="users"
            :size="16"
          />

          <PrettyNumber :value="stream.viewersCount" />
        </div>

        <div class="video-overlay__stat">
          <Icon
            name="clock"
            :size="16"
          />

          <Duration
            v-if="stream"
            :date-start="stream.dateStarted"
          />
        </div>
      </div>
    </div>

    <div class="video-controls">
      <div class="video-controls__main">
        <IconButton
          icon="play"
          :size="24"
        />

        <IconButton
          :icon="volumeIcon"
          :size="24"
        />

        <VolumeSlider
          @move="
            (value) => {
              volume = value;
            }
          "
        />
      </div>

      <IconButton
        icon="settings"
        :size="24"
      />

      <IconButton
        icon="pip"
        :size="24"
        @click="togglePictureInPicture"
      />

      <IconButton
        :icon="isFullscreen ? 'minimize' : 'maximize'"
        :size="24"
        @click="toggleFullscreen"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen, useMediaControls } from '@vueuse/core';
import IconButton from './IconButton.vue';
import Icon from './Icon';
import { toRef } from 'vue';
import { type LiveStream } from '@client/shared';
import Duration from '../Duration.vue';
import VolumeSlider from './VolumeSlider';
import PrettyNumber from './PrettyNumber';
import { computed } from 'vue';

const props = defineProps<{
  stream?: LiveStream;
  container: HTMLDivElement | null;
  video: HTMLVideoElement | null;
}>();

const { volume, togglePictureInPicture } = useMediaControls(toRef(props, 'video'));
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(toRef(props, 'container'));

const volumeIcon = computed(() => {
  if (volume.value === 0) {
    return 'volumeOff';
  }

  return volume.value < 0.5 ? 'volumeLow' : 'volume';
});
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.video-overlay {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  gap: 20px;
  padding-top: var(--layout-titlebar-height);
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0.9) 75%);

  &__header {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 4px;
    padding: 0 10px;
  }

  &__category {
    color: var(--theme-color-text-secondary);
    grid-column: span 2;
  }

  &__title {
    @extend %text-heading;
  }

  &__stats {
    grid-column: 2;
    color: var(--theme-color-text-secondary);
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.video-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--theme-color-text-secondary);
  white-space: nowrap;

  &__main {
    margin-right: auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
