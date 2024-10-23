<template>
  <div
    ref="container"
    class="player"
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

    <VideoControls
      v-if="stream"
      v-model:volume="volume"
      :stream="stream"
      :container="container"
      :video="video"
      :is-normalize-audio="isNormalizeAudio"
    />
  </div>
</template>

<script setup lang="ts">
import type { LiveStream } from '@client/shared';
import { useTemplateRef } from 'vue';
import VideoControls from './ui/VideoControls.vue';
import { useStreamPlayer } from '~/services/useStreamPlayer';
import { useVideoCanvas } from '~/services/useVideoCanvas';
import { useHls } from '~/services/useHls';

const props = defineProps<{
  channelName: string;
  stream?: LiveStream;
  playlist?: (name: string, stream?: LiveStream) => Promise<string | undefined>;
}>();

defineEmits<{
  close: [];
}>();

const container = useTemplateRef('container');
const video = useTemplateRef('video');
const canvas = useTemplateRef('canvas');
const { volume, isNormalizeAudio } = useStreamPlayer(() => props.stream);

useHls(video, async () => await props.playlist?.(props.channelName, props.stream));

useVideoCanvas(video, canvas, {
  fallbackImageUrl: props.stream?.cover,
});
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.player {
  background-color: #000;
  position: relative;
  z-index: 1;
  overflow: hidden;

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

  .video-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    opacity: 0;
  }

  &:hover .video-overlay {
    opacity: 1;
  }
}
</style>
