<template>
  <div class="player">
    <div class="player__background">
      <canvas
        ref="canvas"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
      />
    </div>

    <video
      ref="video"
      :poster="cover"
      @loadeddata="startCanvasPainting"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import Hls from 'hls.js';
import HlsWorkerUrl from 'hls.js/dist/hls.worker?url';

const props = defineProps<{
  channelName: string;
  cover?: string;
  playlist?: (channel: string) => Promise<string | undefined>;
}>();

defineEmits<{
  close: [];
}>();

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 180;

const playlistUrl = ref<string>();

const video = ref<HTMLVideoElement | null>(null);

const canvas = ref<HTMLCanvasElement | null>(null);

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

function startCanvasPainting (): void {
  if (video.value === null || canvas.value === null || canvasContext.value === null) {
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

function drawInitialCanvasImage (): void {
  if (canvasContext.value === null || props.cover === undefined) {
    return;
  }

  const image = new Image(CANVAS_WIDTH, CANVAS_HEIGHT);

  image.onload = () => {
    canvasContext.value?.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  image.src = props.cover;
}

onMounted(async () => {
  if (canvasContext.value !== null) {
    canvasContext.value.filter = 'blur(20px)';
  }

  drawInitialCanvasImage();

  if (props.playlist === undefined) {
    return;
  }

  playlistUrl.value = await props.playlist(props.channelName);

  if (playlistUrl.value === undefined || video.value === null) {
    return;
  }

  hls.loadSource(playlistUrl.value);

  hls.attachMedia(video.value);

  video.value.play();
});

onBeforeUnmount(() => {
  hls.destroy();
});
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.player {
  background-color: #000;
  position: relative;
  z-index: 1;
  overflow: hidden;
  /* -webkit-app-region: drag; */

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
    padding: 12px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: start;
    justify-content: space-between;
    opacity: 0;

    .player:hover & {
      opacity: 1;
    }

    button {
      -webkit-app-region: no-drag;
    }
  }
}
</style>
