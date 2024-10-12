import { type MaybeRef, computed, ref, toValue, watch } from 'vue';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor
 */
export function useAudioCompressor(target: MaybeRef<HTMLMediaElement | null>) {
  const isEnabled = ref(false);
  const mediaElement = computed(() => toValue(target));

  let audioCtx: AudioContext | null = null;
  let audioSource: MediaElementAudioSourceNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;

  watch(
    mediaElement,
    (value) => {
      console.log(value);

      if (value !== null) {
        audioCtx = new AudioContext();
        audioSource = audioCtx.createMediaElementSource(value);
        audioSource.connect(audioCtx.destination);

        console.log(1, audioCtx, audioSource);

        compressor = new DynamicsCompressorNode(audioCtx, {
          threshold: -50,
          knee: 40,
          ratio: 12,
          attack: 0,
          release: 0.25,
        });
      } else {
        console.log(0, audioCtx, audioSource);

        void audioCtx?.close().then(() => {
          audioCtx = null;
        });

        audioSource = null;
        compressor = null;

        isEnabled.value = false;
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  );

  function enable(): void {
    isEnabled.value = true;

    console.log('??? 1');
    console.log(audioCtx, audioSource, compressor);

    if (audioCtx === null || audioSource === null || compressor === null) {
      return;
    }

    audioSource.disconnect(audioCtx.destination);
    audioSource.connect(compressor);
    compressor.connect(audioCtx.destination);

    console.log(audioSource);
    console.log(compressor);
  }

  function disable(): void {
    isEnabled.value = false;

    console.log('??? 0');
    console.log(audioCtx, audioSource, compressor);

    if (audioCtx === null || audioSource === null || compressor === null) {
      return;
    }

    audioSource.disconnect(compressor);
    compressor.disconnect(audioCtx.destination);
    audioSource.connect(audioCtx.destination);

    console.log(audioSource);
    console.log(compressor);
  }

  function toggle() {
    if (isEnabled.value) {
      disable();
    } else {
      enable();
    }
  }

  return {
    isEnabled,
    toggle,
  };
}
