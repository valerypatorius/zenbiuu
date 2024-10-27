<template>
  <div
    ref="container"
    :class="[
      'player',
      isInactive && 'player--inactive',
    ]"
    @mouseenter="onMouseEnter()"
    @mousemove="onMouseMove()"
    @mouseleave="onMouseLeave()"
  >
    <div class="player__background">
      <canvas
        ref="canvas"
        :width="320"
        :height="180"
      />
    </div>

    <video
      ref="video"
      :poster="stream?.cover"
    />

    <div class="player__overlay">
      <VideoControls
        v-if="stream"
        v-model:volume="volume"
        :stream="stream"
        :container="container"
        :video="video"
        :is-normalize-audio="isNormalizeAudio"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveStream } from '@client/shared';
import { ref, useTemplateRef } from 'vue';
import VideoControls from './ui/VideoControls.vue';
import { useStreamPlayer } from '~/services/useStreamPlayer';
import { useVideoCanvas } from '~/services/useVideoCanvas';
import { useHls } from '~/services/useHls';

const props = defineProps<{
  channelName: string;
  stream?: LiveStream;
  playlist?: (name: string, stream?: LiveStream) => Promise<string | undefined>;
}>();

const container = useTemplateRef('container');
const video = useTemplateRef('video');
const canvas = useTemplateRef('canvas');
const { volume, isNormalizeAudio } = useStreamPlayer(() => props.stream);

useHls(video, async () => await props.playlist?.(props.channelName, props.stream));

useVideoCanvas(video, canvas, {
  fallbackImageUrl: props.stream?.cover,
});

const isInactive = ref(true);
const isControlHovered = ref(false);

let inactivityTimeout: ReturnType<typeof setTimeout> | undefined;

/**
 * @todo Move mousemove logic to composable
 */

function disableInactivityWatcher(): void {
  isInactive.value = false;

  clearTimeout(inactivityTimeout);
}

function onMouseEnter(): void {
  onMouseMove();
}

function onMouseMove(): void {
  if (isControlHovered.value) {
    return;
  }

  disableInactivityWatcher();

  inactivityTimeout = setTimeout(() => {
    isInactive.value = true;
  }, 1500);
}

function onMouseLeave(): void {
  disableInactivityWatcher();
}
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.player {
  background-color: #000;
  position: relative;
  z-index: 1;
  overflow: hidden;

  &--inactive {
    cursor: none;

    .player__overlay {
      display: none;
    }
  }

  &__title {
    @extend %text-heading;
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
    z-index: -1;

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  video {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    padding-top: var(--layout-titlebar-height);
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    opacity: 0;

    .video-controls {
      margin-top: auto;
    }
  }

  &__close {
    margin-left: auto;
    margin-right: 20px;
  }

  &:hover .player__overlay {
    opacity: 1;
  }
}
</style>
