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

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Control from '@/src/components/player/Control.vue';

/**
 * Default volume value
 */
const DEFAULT_VOLUME = 0.25;

export default defineComponent({
  name: 'Volume',
  components: {
    Control,
  },
  props: {
    /**
     * Current volume value
     */
    currentVolume: {
      type: Number,
      default: DEFAULT_VOLUME,
    },

    /**
     * Video element to use as source for audio compressor
     */
    source: {
      type: Object as PropType<HTMLVideoElement>,
      required: true,
    },

    /**
     * Is compressor enabled
     */
    isCompressorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'compressor-toggle'],
  data (): {
    sourceRef: HTMLVideoElement;
    previousVolume: number;
    compressor: {
      ctx?: AudioContext;
      source?: MediaElementAudioSourceNode;
      compressor?: DynamicsCompressorNode;
    };
    } {
    return {
      /**
       * Video element reference
       */
      sourceRef: this.source,

      /**
       * Volume value to use when unmuted
       */
      previousVolume: DEFAULT_VOLUME,

      /**
       * Compressor object
       */
      compressor: {},
    };
  },
  computed: {
    /**
     * CSS styles for slider
     */
    sliderStyles () {
      return {
        ['--progress' as string]: this.currentVolume * 100 + '%',
      };
    },
  },
  mounted () {
    this.initAudioCompressor(this.sourceRef);
  },
  beforeUnmount () {
    this.compressor = {};
  },
  methods: {
    /**
     * Emit "change" event, when volume changes
     */
    onVolumeChange (event: Event): void {
      const { valueAsNumber } = event.target as HTMLInputElement;

      this.sourceRef.volume = valueAsNumber;

      this.$emit('change', valueAsNumber);
    },

    /**
     * Mute or unmute and emit "change" event
     */
    setMuted (isMute: boolean): void {
      const value = isMute ? 0 : this.previousVolume;

      if (isMute) {
        this.previousVolume = this.currentVolume;
      }

      this.sourceRef.volume = value;

      this.$emit('change', value);
    },

    /**
     * Init audio compressor and enable, if needed
     * @link https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor#example
     */
    initAudioCompressor (mediaElement: HTMLVideoElement): void {
      this.compressor = {
        ctx: new AudioContext(),
      };

      const { ctx } = this.compressor;

      if (!ctx) {
        return;
      }

      this.compressor.source = ctx.createMediaElementSource(mediaElement);
      this.compressor.compressor = ctx.createDynamicsCompressor();

      const { source, compressor } = this.compressor;

      if (!source || !compressor) {
        return;
      }

      compressor.threshold.setValueAtTime(-50, ctx.currentTime);
      compressor.knee.setValueAtTime(40, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      source.connect(ctx.destination);

      if (this.isCompressorEnabled) {
        this.toggleCompressor(true);
      }
    },

    /**
     * Toggle compressor state and emit "compressor-toggle" event
     */
    toggleCompressor (isEnable: boolean): void {
      const { ctx, source, compressor } = this.compressor;

      if (!ctx || !source || !compressor) {
        return;
      }

      if (isEnable) {
        source.disconnect(ctx.destination);
        source.connect(compressor);
        compressor.connect(ctx.destination);
      } else {
        source.disconnect(compressor);
        compressor.disconnect(ctx.destination);
        source.connect(ctx.destination);
      }

      this.$emit('compressor-toggle', isEnable);
    },
  },
});
</script>

<style>
  .volume {
    --size-bar: 0.3rem;
    --size-thumb: 1.3rem;

    display: flex;
    align-items: center;
  }

  /** Reset default input styles */
  .volume input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: transparent;
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
  }

  /** Volume bar */
  .volume input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 100%;
    cursor: pointer;
    background-color: transparent;
  }

  .volume-slider::before {
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
  .volume-slider::after {
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

  /** Volume thumb */
  .volume input[type=range]::-webkit-slider-thumb {
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

  .volume input[type=range]:hover::-webkit-slider-thumb {
    opacity: 1;
  }
</style>
