import { type MaybeRef, computed, toValue, watch } from 'vue';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor
 */
export function useAudioCompressor(
  target: MaybeRef<HTMLMediaElement | null>,
  isEnableRaw: MaybeRef<boolean>,
) {
  const mediaElement = computed(() => toValue(target));
  const isEnabled = computed(() => toValue(isEnableRaw));

  let audioCtx: AudioContext | null = null;
  let audioSource: MediaElementAudioSourceNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;

  watch(
    mediaElement,
    (value) => {
      if (value !== null) {
        audioCtx = new AudioContext();
        audioSource = audioCtx.createMediaElementSource(value);
        audioSource.connect(audioCtx.destination);

        compressor = new DynamicsCompressorNode(audioCtx, {
          threshold: -50,
          knee: 40,
          ratio: 12,
          attack: 0,
          release: 0.25,
        });

        if (isEnabled.value) {
          enable();
        }
      } else {
        void audioCtx?.close().then(() => {
          audioCtx = null;
        });

        audioSource = null;
        compressor = null;
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  );

  watch(isEnabled, (value) => {
    if (value) {
      enable();
    } else {
      disable();
    }
  });

  function enable(): void {
    if (audioCtx === null || audioSource === null || compressor === null) {
      return;
    }

    audioSource.disconnect(audioCtx.destination);
    audioSource.connect(compressor);
    compressor.connect(audioCtx.destination);
  }

  function disable(): void {
    if (audioCtx === null || audioSource === null || compressor === null) {
      return;
    }

    audioSource.disconnect(compressor);
    compressor.disconnect(audioCtx.destination);
    audioSource.connect(audioCtx.destination);
  }
}
