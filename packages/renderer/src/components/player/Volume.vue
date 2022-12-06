<template>
  <div class="volume">
    <!-- Mute -->
    <control
      :icon="currentVolume > 0 ? 'VolumeOn' : 'VolumeOff'"
      :title="currentVolume > 0 ? $t('player.mute') : $t('player.unmute')"
      @click="setMuted(currentVolume !== 0)"
    />

    <!-- Volume sLider -->
    <div
      class="volume-slider"
      :style="sliderStyles"
    >
      <input
        type="range"
        tabindex="-1"
        min="0"
        max="1"
        step="any"
        :value="currentVolume"
        @input="onVolumeChange"
      >
    </div>

    <!-- Compressor -->
    <control
      icon="Equalizer"
      :is-disabled="!isCompressorEnabled"
      :title="`${isCompressorEnabled ? $t('disable') : $t('enable')} ${$t('player.compressor')}`"
      @click="toggleCompressor(!isCompressorEnabled)"
    />
  </div>
</template>

<script setup lang="ts">
import Control from '@/src/components/player/Control.vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  /** Current volume value */
  currentVolume: number;

  /** Video element to use as source for audio compressor */
  source: HTMLVideoElement;

  /** Is compressor enabled */
  isCompressorEnabled: boolean;
}>(), {
  currentVolume: 0.25,
  isCompressorEnabled: false,
});

const emit = defineEmits<{
  (e: 'change', value: number): void;
  (e: 'compressor-toggle', isEnable: boolean): void;
}>();

/** Video element reference */
const sourceRef = ref(props.source);

/** Volume value to use when unmuted */
const previousVolume = ref(0.25);

/** Compressor object */
const compressor = ref<{
  ctx?: AudioContext;
  sourceNode?: MediaElementAudioSourceNode;
  compressorNode?: DynamicsCompressorNode;
}>({});

/** CSS styles for slider */
const sliderStyles = computed(() => {
  return {
    '--progress': props.currentVolume * 100 + '%',
  };
});

/**
 * Emit "change" event, when volume changes
 */
function onVolumeChange (event: Event): void {
  const { valueAsNumber } = event.target as HTMLInputElement;

  sourceRef.value.volume = valueAsNumber;

  emit('change', valueAsNumber);
}

/**
 * Mute or unmute and emit "change" event
 */
function setMuted (isMute: boolean): void {
  const value = isMute ? 0 : previousVolume.value;

  if (isMute) {
    previousVolume.value = props.currentVolume;
  }

  sourceRef.value.volume = value;

  emit('change', value);
}

/**
 * Init audio compressor and enable, if needed
 * @link https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor#example
 */
function initAudioCompressor (mediaElement: HTMLVideoElement): void {
  compressor.value = {
    ctx: new AudioContext(),
  };

  const { ctx } = compressor.value;

  if (!ctx) {
    return;
  }

  compressor.value.sourceNode = ctx.createMediaElementSource(mediaElement);
  compressor.value.compressorNode = ctx.createDynamicsCompressor();

  const { sourceNode, compressorNode } = compressor.value;

  if (!sourceNode || !compressorNode) {
    return;
  }

  compressorNode.threshold.setValueAtTime(-50, ctx.currentTime);
  compressorNode.knee.setValueAtTime(40, ctx.currentTime);
  compressorNode.ratio.setValueAtTime(12, ctx.currentTime);
  compressorNode.attack.setValueAtTime(0, ctx.currentTime);
  compressorNode.release.setValueAtTime(0.25, ctx.currentTime);

  sourceNode.connect(ctx.destination);

  if (props.isCompressorEnabled) {
    toggleCompressor(true);
  }
}

/**
 * Toggle compressor state and emit "compressor-toggle" event
 */
function toggleCompressor (isEnable: boolean): void {
  const { ctx, sourceNode, compressorNode } = compressor.value;

  if (!ctx || !sourceNode || !compressorNode) {
    return;
  }

  if (isEnable) {
    sourceNode.disconnect(ctx.destination);
    sourceNode.connect(compressorNode);
    compressorNode.connect(ctx.destination);
  } else {
    sourceNode.disconnect(compressorNode);
    compressorNode.disconnect(ctx.destination);
    sourceNode.connect(ctx.destination);
  }

  emit('compressor-toggle', isEnable);
}

onMounted(() => {
  initAudioCompressor(sourceRef.value);
});

onBeforeUnmount(() => {
  compressor.value = {};
});
</script>

<style lang="postcss">
  .volume {
    --size-bar: 0.3rem;
    --size-thumb: 1.3rem;

    display: flex;
    align-items: center;

    /** Reset default input styles */
    input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      background: transparent;

      /** Volume bar */
      &::-webkit-slider-runnable-track {
        width: 100%;
        height: 100%;
        cursor: pointer;
        background-color: transparent;
      }

      /** Volume thumb */
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: var(--size-thumb);
        height: var(--size-thumb);
        border-radius: var(--radius);
        background-color: var(--color-text);
        opacity: 0;
        position: relative;
        z-index: 2;
        margin-top: 0;
      }

      &:hover::-webkit-slider-thumb {
        opacity: 1;
      }
    }
  }

  /** Volume slider container */
  .volume-slider {
    --size-thumb: 1.8rem;
    --radius: 10rem;
    --height: 0.3rem;

    width: 16rem;
    height: var(--size-control);
    overflow: hidden;
    display: flex;
    align-items: center;
    position: relative;
    flex: 1;
    margin: 0 1rem;
    transform: translate3d(0, 0, 0);

    /** Volume bar */
    &::before {
      content: '';
      width: 100%;
      height: var(--height);
      background-color: var(--color-control-active);
      border-radius: var(--height);
      position: absolute;
      left: 0;
      z-index: -2;
    }

    /** Volume bar for current value */
    &::after {
      content: '';
      width: var(--progress);
      height: var(--height);
      background-color: var(--color-text);
      border-radius: var(--height);
      position: absolute;
      left: 0;
      pointer-events: none;
      z-index: -1;
    }
  }
</style>
