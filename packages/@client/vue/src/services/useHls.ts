import type { MaybeElementRef } from '@vueuse/core';
import Hls from 'hls.js';
import HlsWorkerUrl from 'hls.js/dist/hls.worker?url';
import { computed, onBeforeUnmount, onMounted, ref, toValue } from 'vue';

export function useHls(
  videoEl: MaybeElementRef<HTMLVideoElement | null>,
  playlistGetter: () => Promise<string | undefined>,
) {
  const video = computed(() => toValue(videoEl));
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

  onMounted(async () => {
    playlistUrl.value = await playlistGetter();

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
}
