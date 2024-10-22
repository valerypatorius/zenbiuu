<template>
  <div
    ref="container"
    class="player"
  >
    <div class="player__background">
      <canvas
        ref="canvas"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
      />
    </div>

    <video
      ref="video"
      :poster="stream?.cover"
      @loadeddata="startCanvasPainting"
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
import Hls from 'hls.js';
import HlsWorkerUrl from 'hls.js/dist/hls.worker?url';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import VideoControls from './ui/VideoControls.vue';
import { useStreamPlayer } from '~/services/useStreamPlayer';

const props = defineProps<{
  stream?: LiveStream;
  playlist?: (name: string, stream?: LiveStream) => Promise<string | undefined>;
}>();

defineEmits<{
  close: [];
}>();

const { volume, isNormalizeAudio } = useStreamPlayer(() => props.stream);

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 180;

const container = useTemplateRef('container');
const video = useTemplateRef('video');
const canvas = useTemplateRef('canvas');

const playlistUrl = ref<string>();

const hls = new Hls({
  // debug: true,
  // progressive: true,
  enableWorker: true,
  workerPath: HlsWorkerUrl,
  startLevel: -1,

  capLevelOnFPSDrop: true,
  liveDurationInfinity: true,
  liveSyncDurationCount: 1,
  liveMaxLatencyDurationCount: 3,
});

const canvasContext = computed(() => canvas.value?.getContext('2d') ?? null);

let isCanDrawCanvas = false;

function startCanvasPainting(): void {
  if (
    video.value === null ||
    canvas.value === null ||
    canvasContext.value === null
  ) {
    return;
  }

  isCanDrawCanvas = !isCanDrawCanvas;

  if (isCanDrawCanvas) {
    const { width, height } = canvas.value;

    canvasContext.value.drawImage(video.value, 0, 0, width, height);
  }

  /**
   * @todo Perform cleanup on unmount
   */
  requestAnimationFrame(startCanvasPainting);
}

function drawInitialCanvasImage(): void {
  if (canvasContext.value === null || props.stream?.cover === undefined) {
    return;
  }

  const image = new Image(CANVAS_WIDTH, CANVAS_HEIGHT);

  image.onload = () => {
    canvasContext.value?.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  image.src = props.stream.cover;
}

onMounted(async () => {
  if (canvasContext.value !== null) {
    canvasContext.value.filter = 'blur(20px)';
  }

  drawInitialCanvasImage();

  if (props.playlist === undefined || props.stream === undefined) {
    return;
  }

  playlistUrl.value = await props.playlist(
    props.stream.channelName,
    props.stream,
  );

  if (playlistUrl.value === undefined || video.value === null) {
    return;
  }

  hls.loadSource(playlistUrl.value);

  hls.attachMedia(video.value);

  await video.value.play();
});

onBeforeUnmount(() => {
  hls.destroy();
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
