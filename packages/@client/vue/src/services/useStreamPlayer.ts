import type { LiveStream } from '@client/shared';
import {
  computed,
  ref,
  toValue,
  watchEffect,
  type MaybeRefOrGetter,
} from 'vue';
import { useLibrary } from './useLibrary';
import { useSettings } from './useSettings';

export function useStreamPlayer(
  target: MaybeRefOrGetter<LiveStream | undefined>,
) {
  const { getChannelVolume, saveChannelVolume } = useLibrary();
  const { isAudioCompressorEnabled } = useSettings();

  const stream = computed(() => toValue(target));

  const volume = ref(
    stream.value ? getChannelVolume(stream.value.channelName) : 0,
  );

  watchEffect(() => {
    if (stream.value) {
      saveChannelVolume(stream.value.channelName, volume.value);
    }
  });

  return {
    volume,
    isNormalizeAudio: isAudioCompressorEnabled,
  };
}
