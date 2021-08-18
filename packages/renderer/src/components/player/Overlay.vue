<template>
  <div class="player-overlay">
    <!-- Sidebar and chat togglers. Not shown in fullscreen mode -->
    <div
      v-if="!isFullscreen"
      class="player-overlay__top"
    >
      <control
        :size="ControlSize.Large"
        :icon="isSidebarHidden ? 'ArrowFromLeft' : 'ArrowToLeft'"
        :title="isSidebarHidden ? $t('player.showSidebar') : $t('player.hideSidebar')"
        @click="toggleSidebar"
        @mouseenter="onControlMouseEnter"
        @mouseleave="onControlMouseLeave"
      />

      <control
        v-if="isHorizontalLayout"
        :size="ControlSize.Large"
        :icon="isChatHidden ? 'ArrowFromRight' : 'ArrowToRight'"
        :title="isChatHidden ? $t('player.showChat') : $t('player.hideChat')"
        @click="toggleChat"
        @mouseenter="onControlMouseEnter"
        @mouseleave="onControlMouseLeave"
      />
    </div>

    <div class="player-panel">
      <div
        v-if="streamInfo"
        class="player-panel__info"
      >
        <!-- Stream title -->
        <div class="player-panel__title">
          <a
            :href="channelUrl"
            :title="`${$t('openInBrowser')} ${channelUrl}`"
          >
            {{ streamInfo.title }}
          </a>
        </div>

        <!-- Stream duration -->
        <div
          class="player-panel__counter"
          :title="startedAtFormatted"
        >
          <icon name="Time" />

          <duration :start="streamInfo.started_at" />
        </div>

        <!-- Viewers counter -->
        <div class="player-panel__counter">
          <icon name="User" />
          {{ streamInfo.viewer_count.toLocaleString() }}
        </div>

        <!-- Category -->
        <div class="player-panel__counter">
          <icon name="Pacman" />
          {{ streamInfo.game_name }}
        </div>
      </div>

      <div class="player-panel__controls">
        <!-- Volume settings -->
        <volume
          v-if="elements.video"
          :source="elements.video"
          :current-volume="currentVolume"
          :is-compressor-enabled="isCompressorEnabled"
          @change="onVolumeChange"
          @compressor-toggle="onAudioCompressorToggle"
          @mouseenter="onControlMouseEnter"
          @mouseleave="onControlMouseLeave"
        />

        <!-- Quality picker -->
        <picker
          :is-disabled="prettyQualityLevels.length <= 1"
          :items="prettyQualityLevels"
          :active="currentQualityLevel"
          @change="setQualityLevel"
          @mouseenter="onControlMouseEnter"
          @mouseleave="onControlMouseLeave"
        />

        <!-- Fullscreen -->
        <control
          :icon="isFullscreen ? 'FullscreenExit' : 'Fullscreen'"
          :title="isFullscreen ? $t('player.exitFullscreen') : $t('player.enterFullscreen')"
          @click="toggleFullscreen"
          @mouseenter="onControlMouseEnter"
          @mouseleave="onControlMouseLeave"
        />

        <!-- Toggle layout -->
        <control
          v-if="!isFullscreen"
          icon="LayoutChange"
          :title="isHorizontalLayout ? $t('player.setVerticalLayout') : $t('player.setHorizontalLayout')"
          @click="toggleLayout"
          @mouseenter="onControlMouseEnter"
          @mouseleave="onControlMouseLeave"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';
import Control, { Size as ControlSize } from '@/src/components/player/Control.vue';
import Picker, { PickerItem } from '@/src/components/player/Picker.vue';
import Volume from '@/src/components/player/Volume.vue';
import Duration from '@/src/components/Duration.vue';
import { PlayerLayout } from '@/types/renderer/player';
import { TOGGLE_PLAYER_SIDEBAR, TOGGLE_PLAYER_CHAT, TOGGLE_PLAYER_LAYOUT, SET_PLAYER_VOLUME, SET_PLAYER_AUDIO_COMPRESSOR } from '@/src/store/actions';
import type { TwitchStream } from '@/types/renderer/library';
import type { PlayerElements } from '@/types/renderer/player';
import type { Level } from 'hls.js';

export default defineComponent({
  name: 'PlayerOverlay',
  components: {
    Icon,
    Control,
    Picker,
    Volume,
    Duration,
  },
  props: {
    /**
     * Current channel name
     */
    channelName: {
      type: String,
      default: '',
    },

    /**
     * Active stream info, if available
     */
    streamInfo: {
      type: Object as PropType<TwitchStream>,
      default: undefined,
    },

    /**
     * Current player volume
     */
    currentVolume: {
      type: Number,
      default: 0,
    },

    /**
     * Available quality levels. Raw
     */
    qualityLevels: {
      type: Array,
      default: () => [],
    },

    /**
     * True, if app sidebar is hidden
     */
    isSidebarHidden: {
      type: Boolean,
      default: false,
    },

    /**
     * True, if chat is hidden
     */
    isChatHidden: {
      type: Boolean,
      default: false,
    },

    /**
     * Player DOM-elements list
     */
    elements: {
      type: Object as PropType<Partial<PlayerElements>>,
      default: () => ({}),
    },
  },
  emits: ['change-quality', 'control-mouse-enter', 'control-mouse-leave'],
  data (): {
    ControlSize: typeof ControlSize;
    isFullscreen: boolean;
    currentQualityLevel: number;
    } {
    return {
      /**
       * Available controls sizes
       */
      ControlSize,

      /**
       * Current fullscreen state
       */
      isFullscreen: false,

      /**
       * Current video quality level
       */
      currentQualityLevel: -1,
    };
  },
  computed: {
    /**
     * Returns true, if current player layout is "horizontal"
     */
    isHorizontalLayout (): boolean {
      return this.$store.state.player.layout === PlayerLayout.Horizontal;
    },

    /**
     * Returns true, if audio compressor is enabled
     */
    isCompressorEnabled (): boolean {
      return this.$store.state.player.compressor;
    },

    /**
     * Twitch channel url
     */
    channelUrl (): string {
      return `https://twitch.tv/${this.channelName}`;
    },

    /**
     * Stream start date formatted
     */
    startedAtFormatted (): string {
      if (!this.streamInfo) {
        return '';
      }

      const startedAtDate = new Date(this.streamInfo.started_at);

      return `${this.$t('player.startedAt')} ${startedAtDate.toLocaleTimeString()}, ${startedAtDate.toLocaleDateString()}`;
    },

    /**
     * Quality levels, prettified for display
     */
    prettyQualityLevels (): PickerItem[] {
      const list = (this.qualityLevels as Level[]).map((data, index) => {
        const { RESOLUTION, 'FRAME-RATE': FRAMERATE, VIDEO } = data.attrs;
        let label = '';
        let short = '';

        if (RESOLUTION && FRAMERATE) {
          const resolution = RESOLUTION.match(/\d+/g);
          const quality = resolution && resolution[1] ? resolution[1] : '???';
          const fps = parseInt(FRAMERATE, 10);

          label = `${quality}p ${fps}fps`;
          short = `${quality}p`;
        }

        if (VIDEO === 'chunked') {
          label += ` (${this.$t('player.source')})`;
        }

        return {
          index,
          label,
          short,
        };
      });

      return [
        {
          index: -1,
          label: this.$t('player.auto'),
          short: 'Auto',
        },
        ...list,
      ];
    },
  },
  mounted () {
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  },
  beforeUnmount () {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  },
  methods: {
    /**
     * Toggle sidebar visibility
     */
    toggleSidebar (): void {
      this.$store.dispatch(TOGGLE_PLAYER_SIDEBAR);
    },

    /**
     * Toggle chat visibility
     */
    toggleChat (): void {
      this.$store.dispatch(TOGGLE_PLAYER_CHAT);
    },

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen (): void {
      const { player } = this.elements;

      if (this.isFullscreen) {
        document.exitFullscreen();
      } else {
        player?.requestFullscreen();
      }
    },

    /**
     * Set specified player layout
     */
    toggleLayout (): void {
      this.$store.dispatch(TOGGLE_PLAYER_LAYOUT);
    },

    /**
     * Update current fullscreen state, based on document state
     */
    onFullscreenChange (): void {
      this.isFullscreen = document.fullscreenElement !== null;
    },

    /**
     * Set player volume in settings
     */
    onVolumeChange (value: number): void {
      this.$store.dispatch(SET_PLAYER_VOLUME, value);
    },

    /**
     * Set compressor state in settings
     */
    onAudioCompressorToggle (isEnabled: boolean): void {
      this.$store.dispatch(SET_PLAYER_AUDIO_COMPRESSOR, isEnabled);
    },

    /**
     * Set quality level
     */
    setQualityLevel ({ index }: { index: number }): void {
      this.currentQualityLevel = index;

      this.$emit('change-quality', index);
    },

    onControlMouseEnter () {
      this.$emit('control-mouse-enter');
    },

    onControlMouseLeave () {
      this.$emit('control-mouse-leave');
    },
  },
});
</script>

<style>
  .player-overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-image: linear-gradient(0deg, var(--color-overlay-full) 15%, var(--color-transparent) 100%),
    linear-gradient(180deg, var(--color-overlay-full) 0%, var(--color-transparent) 30%);
    background-position: 0 0, 0 100%;
    background-repeat: no-repeat;
    visibility: hidden;
    opacity: 0;
    transition: all 0.1s var(--easing);
  }

  .player-overlay__top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: var(--offset-window);
    display: flex;
    justify-content: space-between;
  }

  .player-panel {
    transition: transform 0.1s var(--easing);
    position: absolute;
    width: 100%;
    padding: var(--offset-window);
    bottom: 0;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 2rem;
  }

  .player-panel__info {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, min-content) minmax(0, min-content) 1fr;
    justify-content: start;
    gap: 1.6rem 3rem;
  }

  .player-panel__title {
    grid-column: span 3;
    min-width: 0;
    font-size: 2rem;
    line-height: 1.6em;
    text-decoration: none;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .player-panel__controls {
    display: grid;
    grid-template-columns: auto auto auto auto;
    gap: 1rem;
    position: relative;
  }

  .player-panel__counter {
    font-size: 1.5rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
  }

  .player-panel__counter .icon {
    margin-right: 0.6rem;
  }
</style>
