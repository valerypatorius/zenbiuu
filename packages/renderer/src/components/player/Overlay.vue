<template>
  <div class="player-overlay">
    <!-- Sidebar and chat togglers. Not shown in fullscreen mode -->
    <div
      v-if="!isFullscreen"
      class="player-overlay__top"
    >
      <Control
        size="large"
        :icon="isSidebarHidden ? 'ArrowFromLeft' : 'ArrowToLeft'"
        :title="isSidebarHidden ? t('player.showSidebar') : t('player.hideSidebar')"
        @click="toggleSidebar"
        @mouseenter="onControlMouseEnter"
        @mouseleave="onControlMouseLeave"
      />

      <Control
        v-if="isHorizontalLayout"
        size="large"
        :icon="isChatHidden ? 'ArrowFromRight' : 'ArrowToRight'"
        :title="isChatHidden ? t('player.showChat') : t('player.hideChat')"
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
            :title="`${t('openInBrowser')} ${channelUrl}`"
          >
            {{ streamInfo.title }}
          </a>
        </div>

        <!-- Stream duration -->
        <div
          class="player-panel__counter"
          :title="startedAtFormatted"
        >
          <Icon name="Time" />

          <Duration :start="streamInfo.started_at" />
        </div>

        <!-- Viewers counter -->
        <div class="player-panel__counter">
          <Icon name="User" />
          {{ streamInfo.viewer_count.toLocaleString() }}
        </div>

        <!-- Category -->
        <div class="player-panel__counter">
          <Icon name="Pacman" />
          {{ streamInfo.game_name }}
        </div>
      </div>

      <div class="player-panel__controls">
        <!-- Volume settings -->
        <Volume
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
        <Picker
          :is-disabled="prettyQualityLevels.length <= 1"
          :items="prettyQualityLevels"
          :active="currentQualityLevel"
          @change="setQualityLevel"
          @mouseenter="onControlMouseEnter"
          @mouseleave="onControlMouseLeave"
        />

        <!-- Fullscreen -->
        <Control
          :icon="isFullscreen ? 'FullscreenExit' : 'Fullscreen'"
          :title="isFullscreen ? t('player.exitFullscreen') : t('player.enterFullscreen')"
          @click="toggleFullscreen"
          @mouseenter="onControlMouseEnter"
          @mouseleave="onControlMouseLeave"
        />

        <!-- Toggle layout -->
        <Control
          v-if="!isFullscreen"
          icon="LayoutChange"
          :title="isHorizontalLayout ? t('player.setVerticalLayout') : t('player.setHorizontalLayout')"
          @click="toggleLayout"
          @mouseenter="onControlMouseEnter"
          @mouseleave="onControlMouseLeave"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '@/src/components/ui/Icon.vue';
import Control from '@/src/components/player/Control.vue';
import Picker, { PickerItem } from '@/src/components/player/Picker.vue';
import Volume from '@/src/components/player/Volume.vue';
import Duration from '@/src/components/Duration.vue';
import { PlayerLayout } from '@/types/renderer/player';
import type { TwitchStream } from '@/types/renderer/library';
import type { PlayerElements } from '@/types/renderer/player';
import type { Level } from 'hls.js';
import { usePlayerState } from '@/src/store/usePlayerState';

const props = defineProps<{
  /** Current channel name */
  channelName: string;

  /** Active stream info, if available */
  streamInfo?: TwitchStream;

  /** Current player volume */
  currentVolume: number;

  /** Available quality levels. Raw */
  qualityLevels: Level[];

  /** True, if app sidebar is hidden */
  isSidebarHidden: boolean;

  /** True, if chat is hidden */
  isChatHidden: boolean;

  /** Player DOM-elements list */
  elements: Partial<PlayerElements>;
}>();

const emit = defineEmits<{
  (e: 'change-quality', index: number): void;
  (e: 'control-mouse-enter'): void;
  (e: 'control-mouse-leave'): void;
}>();

const { t } = useI18n();
const { state: playerState, toggleChat, toggleSidebar, toggleLayout, setVolume, setCompressor } = usePlayerState();

/** Current fullscreen state */
const isFullscreen = ref(false);

/** Current video quality level */
const currentQualityLevel = ref(-1);

/** Returns true, if current player layout is "horizontal" */
const isHorizontalLayout = computed(() => playerState.layout === PlayerLayout.Horizontal);

/** Returns true, if audio compressor is enabled */
const isCompressorEnabled = computed(() => playerState.compressor);

/** Twitch channel url */
const channelUrl = computed(() => `https://twitch.tv/${props.channelName}`);

/** Stream start date formatted */
const startedAtFormatted = computed(() => {
  if (!props.streamInfo) {
    return '';
  }

  const startedAtDate = new Date(props.streamInfo.started_at);

  return `${t('player.startedAt')} ${startedAtDate.toLocaleTimeString()}, ${startedAtDate.toLocaleDateString()}`;
});

/** Quality levels, prettified for display */
const prettyQualityLevels = computed<PickerItem[]>(() => {
  const list = props.qualityLevels.map((data, index) => {
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
      label += ` (${t('player.source')})`;
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
      label: t('player.auto'),
      short: 'Auto',
    },
    ...list,
  ];
});

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen (): void {
  const { player } = props.elements;

  if (isFullscreen.value) {
    document.exitFullscreen();
  } else {
    player?.requestFullscreen();
  }
}

/**
 * Update current fullscreen state, based on document state
 */
function onFullscreenChange (): void {
  isFullscreen.value = document.fullscreenElement !== null;
}

/**
 * Set player volume in settings
 */
function onVolumeChange (value: number): void {
  setVolume(value);
}

/**
 * Set compressor state in settings
 */
function onAudioCompressorToggle (isEnabled: boolean): void {
  setCompressor(isEnabled);
}

/**
 * Set quality level
 */
function setQualityLevel ({ index }: { index: number }): void {
  currentQualityLevel.value = index;

  emit('change-quality', index);
}

function onControlMouseEnter () {
  emit('control-mouse-enter');
}

function onControlMouseLeave () {
  emit('control-mouse-leave');
}
</script>

<style lang="postcss">
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

    &__top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      padding: var(--offset-window);
      display: flex;
      justify-content: space-between;
    }
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

    &__info {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, min-content) minmax(0, min-content) 1fr;
      justify-content: start;
      gap: 1.6rem 3rem;
    }

    &__title {
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

    &__controls {
      display: grid;
      grid-template-columns: auto auto auto auto;
      gap: 1rem;
      position: relative;
    }

    &__counter {
      font-size: 1.5rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;

      .icon {
        margin-right: 0.6rem;
      }
    }
  }
</style>
