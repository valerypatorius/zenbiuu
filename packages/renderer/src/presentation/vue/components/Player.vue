<template>
  <div class="player">
    <div
      class="player__background"
      :style="{
        'background-image': `url(${cover})`,
      }"
    />

    <video
      ref="video"
      :poster="cover"
      controls
    />

    <div class="player__overlay">
      <div class="player__title">
        {{ channelName }}
      </div>

      <Button
        class="player__close"
        @click="emit('close')"
      >
        Close
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Hls from 'hls.js';
import HlsWorkerUrl from 'hls.js/dist/hls.worker?url';
import Button from './ui/Button.vue';

const props = defineProps<{
  channelName: string;
  cover?: string;
  playlist: (channel: string) => Promise<string | undefined>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const playlistUrl = ref<string>();

const video = ref<HTMLVideoElement>();

const hls = new Hls({
  // debug: true,
  enableWorker: true,
  workerPath: HlsWorkerUrl,
  startLevel: -1,
  // progressive: true,

  // capLevelOnFPSDrop: true,
  // liveDurationInfinity: true,
  // liveSyncDurationCount: 1,
  // liveMaxLatencyDurationCount: 3,
});

onMounted(async () => {
  playlistUrl.value = await props.playlist(props.channelName);

  if (playlistUrl.value === undefined || video.value === undefined) {
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
    opacity: 0.3;
    filter: blur(20px);
    transform: scale(1.25);
    z-index: -1;
  }

  video {
    width: 100%;
    height: 100%;
    /* object-fit: contain; */
  }

  &__overlay {
    padding: 20px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    visibility: hidden;

    button {
      pointer-events: auto;
    }
  }
}
</style>
