import { useEventListener, type MaybeElementRef } from '@vueuse/core';
import { computed, onBeforeUnmount, onMounted, toValue } from 'vue';

export function useVideoCanvas(
  videoEl: MaybeElementRef<HTMLVideoElement | null>,
  canvasEl: MaybeElementRef<HTMLCanvasElement | null>,
  options: {
    fallbackImageUrl?: string;
  } = {},
) {
  const video = computed(() => toValue(videoEl));
  const canvas = computed(() => toValue(canvasEl));
  const canvasContext = computed(() => toValue(canvasEl)?.getContext('2d') ?? null);
  const size = computed(() => [canvas.value?.width ?? 640, canvas.value?.height ?? 360] as const);

  let isCanDrawCanvas = false;
  let rafId: number | undefined;

  function drawFallbackImage(): void {
    if (canvasContext.value === null || options.fallbackImageUrl === undefined) {
      return;
    }

    const image = new Image(size.value[0], size.value[1]);

    image.onload = () => {
      canvasContext.value?.drawImage(image, 0, 0, size.value[0], size.value[1]);
    };

    image.src = options.fallbackImageUrl;
  }

  function startCanvasPainting(): void {
    if (video.value === null || canvasContext.value === null) {
      return;
    }

    /**
     * Paint every 2th frame
     */
    isCanDrawCanvas = !isCanDrawCanvas;

    if (isCanDrawCanvas) {
      canvasContext.value.drawImage(video.value, 0, 0, size.value[0], size.value[1]);
    }

    rafId = requestAnimationFrame(startCanvasPainting);
  }

  useEventListener(video, 'loadeddata', () => {
    startCanvasPainting();
  });

  onMounted(async () => {
    if (canvasContext.value !== null) {
      canvasContext.value.filter = 'blur(20px)';
    }

    drawFallbackImage();
  });

  onBeforeUnmount(() => {
    isCanDrawCanvas = false;

    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }
  });
}
