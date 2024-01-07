<template>
  <div class="player">
    <div
      class="player__background"
      :style="{
        'background-image': `url(${cover})`,
      }"
    >
      <canvas
        ref="canvas"
        width="640"
        height="360"
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
import { onBeforeUnmount, onMounted, ref } from 'vue';
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

function startCanvasPainting (): void {
  if (video.value === null || canvas.value === null) {
    return;
  }

  const { width, height } = canvas.value;
  const ctx = canvas.value.getContext('2d');

  if (ctx === null) {
    return;
  }

  ctx.drawImage(video.value, 0, 0, width, height);

  /**
   * @todo Perform cleanup on unmount
   */
  requestAnimationFrame(startCanvasPainting);
}

onMounted(async () => {
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
  /* border-radius: 12px 0 0 12px; */

  &__title {
    @extend %text-heading;
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: 50% 50%;
    opacity: 0.25;
    filter: blur(20px);
    transform: scale(1.5);
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
    /* object-fit: contain; */
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
