<template>
  <div class="video-controls">
    <div class="video-controls__info">
      <div class="video-controls__category">
        {{ stream.category }}
      </div>

      <div class="video-controls__title">
        {{ stream.title }}
      </div>

      <div class="video-controls__stats">
        <div class="video-controls__stat">
          <Icon name="users" :size="16" />

          <PrettyNumber :value="stream.viewersCount" />
        </div>

        <div class="video-controls__stat">
          <Icon name="clock" :size="16" />

          <Duration :date-start="stream.dateStarted" />
        </div>
      </div>
    </div>

    <div class="video-controls__main">
      <!-- <IconButton icon="pause" :size="24" /> -->

      <IconButton
        :icon="volumeIcon"
        :size="24"
        @click="() => {
          volume = volume === 0 ? 1 : 0;
        }"
      />

      <VolumeSlider v-model="volume" />

      <div class="video-controls__spacer" />

      <!-- <IconButton icon="settings" :size="24" /> -->

      <IconButton
        icon="pip"
        :size="24"
        @click="togglePictureInPicture()"
      />

      <IconButton
        :icon="isFullscreen ? 'minimize' : 'maximize'"
        :size="24"
        @click="toggleFullscreen()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveStream } from '@client/shared';
import { useFullscreen, useMediaControls } from '@vueuse/core';
import { onBeforeMount, toRef } from 'vue';
import { computed } from 'vue';
import { useAudioCompressor } from '~/services/useAudioCompressor';
import Duration from '../Duration.vue';
import Icon from './Icon';
import IconButton from './IconButton.vue';
import PrettyNumber from './PrettyNumber';
import VolumeSlider from './VolumeSlider';

const props = defineProps<{
  stream: LiveStream;
  container: HTMLDivElement | null;
  video: HTMLVideoElement | null;
  isNormalizeAudio?: boolean;
}>();

const volume = defineModel('volume', {
  type: Number,
  default: 0,
  set(v) {
    mediaVolume.value = v;

    return v;
  },
});

const { volume: mediaVolume, togglePictureInPicture } = useMediaControls(toRef(props, 'video'));
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(toRef(props, 'container'));

useAudioCompressor(toRef(props, 'video'), toRef(props, 'isNormalizeAudio'));

const volumeIcon = computed(() => {
  if (volume.value === 0) {
    return 'volumeOff';
  }

  return volume.value < 0.5 ? 'volumeLow' : 'volume';
});

onBeforeMount(() => {
  mediaVolume.value = volume.value;
});
</script>

<style lang="postcss">
@import "~/styles/typography.pcss";

.video-controls {
  width: 100%;
  height: 600px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  gap: 20px;
  background-image: linear-gradient(to bottom,
      rgba(0, 0, 0, 0) 25%,
      rgba(0, 0, 0, 0.95) 75%);

  &__info {
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

  &__main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__spacer {
    flex: 1;
  }
}
</style>
