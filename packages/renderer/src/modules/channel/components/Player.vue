<template>
  <div
    ref="player"
    :class="[
      'player',
      {
        'player--with-blur': isBlurEnabled,
        'player--loading': !isVideoReady,
        'player--inactive': isInactive,
        'player--with-sidebar': !isSidebarHidden,
        'player--with-chat': !isChatHidden,
      },
    ]"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- Blurred thumbnail background -->
    <div
      v-if="isBlurEnabled && thumbnail && !videoBackgroundInterval"
      class="player__thumbnail"
      :style="{
        backgroundImage: `url(${thumbnail})`,
      }"
    />

    <!-- Blurred dynamic video background -->
    <canvas
      v-show="isBlurEnabled"
      ref="canvas"
      :width="videoBackground.width"
      :height="videoBackground.height"
      class="player__video-background"
    />

    <!-- Loader -->
    <div
      v-if="!isVideoReady && !isOffline"
      class="player__loader"
    >
      <Loader />
    </div>

    <!-- Video player -->
    <video
      v-show="isVideoReady"
      ref="video"
    />

    <!-- Overlay with controls -->
    <PlayerOverlay
      v-if="isVideoReady && !isOffline"
      :elements="playerElements"
      :stream-info="info"
      :current-volume="currentVolume"
      :channel-name="channelName"
      :is-sidebar-hidden="isSidebarHidden"
      :is-chat-hidden="isChatHidden"
      :quality-levels="(qualityLevels as Level[])"
      @change-quality="onQualityChange"
      @control-mouse-enter="onControlMouseEnter"
      @control-mouse-leave="onControlMouseLeave"
    />

    <!-- Additional info messages -->
    <PlayerInfo
      v-if="isVideoReady && hls"
      :hls="hls"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue';
import date from '@/src/utils/date';
import Hls, { HlsConfig } from 'hls.js';
import Loader from '@/src/modules/ui/components/Loader.vue';
import PlayerOverlay from '@/src/modules/channel/components/player/Overlay.vue';
import PlayerInfo from '@/src/modules/channel/components/player/Info.vue';
import type { Level } from 'hls.js';
import type { PlayerElements } from '@/types/renderer/player';
import { usePlayer } from '@/src/store/usePlayer';
import { useLibrary } from '@/src/store/useLibrary';
import { useApp } from '@/src/store/useApp';
import { useStats } from '@/src/store/useStats';
import { useInterval } from '@/src/infrastructure/interval/useInterval';

export type HlsInstance = InstanceType<typeof Hls>;

const props = defineProps<{
  /** Current channel name */
  channelName: string;

  /** Current channel id */
  channelId: string;
}>();

/**
 * Stats posting interval for earning channel points
 */
const STATS_POST_FREQUENCY = date.Minute;

/**
 * Delay before enabling inactivity mode
 */
const INACTIVITY_DELAY = 2 * date.Second;

/**
 * Initial hls.js config
 */
const HLS_CONFIG: Partial<HlsConfig> = {
  debug: false,
  capLevelOnFPSDrop: true,
  liveDurationInfinity: true,
  liveSyncDurationCount: 1,
  liveMaxLatencyDurationCount: 3,
};

const { state: appState } = useApp();
const { followedStreams, foundStreams, lastUpdateTime } = useLibrary();
const { state: playerState, getPlaylist } = usePlayer();
const { send: sendStats, prepareUrlForChannel: prepareStatsUrlForChannel } = useStats();
const { start: startInterval } = useInterval();

const player = ref<HTMLDivElement>();

const canvas = ref<HTMLCanvasElement>();

const video = ref<HTMLVideoElement>();

/** Hls instance */
const hls = ref<HlsInstance>();

/** Is video ready to play */
const isVideoReady = ref(false);

/** Raw quality levels list */
const qualityLevels = ref<Level[]>([]);

/** Function to stop stats interval */
const stopStatsInterval = ref<() => void>();

/** Video background update interval object */
const videoBackgroundInterval = ref<ReturnType<typeof requestAnimationFrame>>();

/** Video background dimensions */
const videoBackground = reactive({
  width: 640,
  height: 360,
});

/** Inactivity interval id */
const inactivityInterval = ref<ReturnType<typeof setTimeout>>();

/** If true, interface and cursor will be hidden */
const isInactive = ref(false);

/** True, when both playlist and stream info are not available */
const isOffline = ref(false);

/**
 * True, if overlay control is hovered.
 * Disables inactivity watcher
 */
const isControlHovered = ref(false);

/**
 * DOM-elements, which properties are modified
 * by player and its child components
 */
const playerElements = ref<Partial<PlayerElements>>({});

/** Returns true, if interface blur is enabled in settings */
const isBlurEnabled = computed(() => appState.settings.isBlurEnabled);

/** Returns true, if sidebar is hidden by user */
const isSidebarHidden = computed(() => playerState.isHideSidebar);

/** Returns true, if sidebar is chat by user */
const isChatHidden = computed(() => playerState.isHideChat);

/** Current volume value */
const currentVolume = computed(() => playerState.volume);

/** Stream info */
const info = computed(() => {
  const followedStreamData = followedStreams.value.find((stream) => stream.user_login === props.channelName);
  const foundStreamData = foundStreams.value.find((stream) => stream.user_login === props.channelName);

  return followedStreamData ?? foundStreamData;
});

/** Stream thumbnail url */
const thumbnail = computed(() => {
  if (playerState.cover) {
    return playerState.cover;
  }

  if (!info.value) {
    return '';
  }

  return `${info.value.thumbnail_url.replace(/\{width\}/, '640').replace(/\{height\}/, '360')}?v=${lastUpdateTime.value}`;
});

onMounted(() => {
  /**
   * Save rendered elements
   */
  playerElements.value.player = player.value;
  playerElements.value.video = video.value;
  playerElements.value.canvas = canvas.value;

  /**
   * Prepare stats posting url
   */
  prepareStatsUrlForChannel(props.channelName);

  /**
   * Send player stats every 1 minute
   */
  stopStatsInterval.value = startInterval(() => {
    if (info.value === undefined) {
      return;
    }

    sendStats({
      channelName: props.channelName,
      channelId: info.value.user_id,
      broadcastId: info.value.id,
    });
  }, STATS_POST_FREQUENCY);

  /**
   * Start playback
   */
  initPlayer();
  loadPlaylist(props.channelName);
});

onBeforeUnmount(() => {
  /**
   * Stop watching for cursor
   */
  if (inactivityInterval.value) {
    clearTimeout(inactivityInterval.value);
    inactivityInterval.value = undefined;
  }

  /**
   * Stop sending stats
   */
  if (stopStatsInterval.value) {
    stopStatsInterval.value();
    stopStatsInterval.value = undefined;
  }

  /**
   * Stop updating video background
   */
  if (videoBackgroundInterval.value) {
    cancelAnimationFrame(videoBackgroundInterval.value);
    videoBackgroundInterval.value = undefined;
  }

  /**
   * Destroy player
   */
  hls.value?.off(Hls.Events.MEDIA_ATTACHED);
  hls.value?.off(Hls.Events.MANIFEST_PARSED);
  hls.value?.off(Hls.Events.INIT_PTS_FOUND);
  hls.value?.destroy();
  hls.value = undefined;
});

/**
 * When quality is changed via picker,
 * set next video fragment quality
 */
function onQualityChange (index: number): void {
  if (!hls.value) {
    return;
  }

  hls.value.nextLevel = index;
}

/**
 * Initialize player without requesting media source
 */
function initPlayer (): void {
  const { video } = playerElements.value;

  if (hls.value || !video) {
    return;
  }

  video.volume = currentVolume.value;

  hls.value = new Hls(HLS_CONFIG);
  hls.value.attachMedia(video);

  /**
   * Wait for source
   */
  hls.value.on(Hls.Events.MEDIA_ATTACHED, () => {
    hls.value?.on(Hls.Events.MANIFEST_PARSED, () => {
      qualityLevels.value = hls.value?.levels ?? [];

      video.play();
    });

    hls.value?.on(Hls.Events.INIT_PTS_FOUND, () => {
      isVideoReady.value = true;

      initVideoBackground();
    });
  });
}

/**
 * Load playlist and pass it to hls
 */
async function loadPlaylist (channel: string): Promise<void> {
  const playlist = await getPlaylist(channel);

  hls.value?.loadSource(playlist);
}

/**
 * Initialize video background
 */
function initVideoBackground (): void {
  videoBackgroundInterval.value = window.requestAnimationFrame(updateVideoBackground);
}

/**
 * Update video background via canvas image (if allowed by settings)
 */
function updateVideoBackground (): void {
  if (!isBlurEnabled.value) {
    videoBackgroundInterval.value = undefined;

    return;
  }

  const { video, canvas } = playerElements.value;

  if (!video || !canvas) {
    return;
  }

  const { width, height } = canvas;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return;
  }

  ctx.drawImage(video, 0, 0, width, height);

  videoBackgroundInterval.value = window.requestAnimationFrame(updateVideoBackground);
}

/**
 * Force mousemove handler to handle some cases
 * (e.g. when user comes from library screen without moving cursor)
 */
function onMouseEnter (): void {
  onMouseMove();
}

/**
 * Enable inactive state, if mouse is not moving
 */
function onMouseMove (): void {
  if (isControlHovered.value) {
    return;
  }

  disableInactivityWatcher();

  inactivityInterval.value = setTimeout(() => {
    isInactive.value = true;
  }, INACTIVITY_DELAY);
}

/**
 * Disable player inactive state
 */
function onMouseLeave (): void {
  disableInactivityWatcher();
}

/**
 * Stop watching for inactive state
 */
function disableInactivityWatcher (): void {
  isInactive.value = false;

  if (inactivityInterval.value) {
    clearTimeout(inactivityInterval.value);
  }
}

/**
 * When overlay control is hovered,
 * disable inactivity watcher
 */
function onControlMouseEnter (): void {
  isControlHovered.value = true;

  disableInactivityWatcher();
}

/**
 * When overlay control is not hovered,
 * resume inactivity watcher
 */
function onControlMouseLeave (): void {
  isControlHovered.value = false;

  onMouseMove();
}
</script>

<style lang="postcss">
  .player {
    position: relative;
    overflow: hidden;
    background-color: var(--color-overlay-full);

    &--with-sidebar {
      border-top-left-radius: var(--border-radius);
    }

    &--with-chat {
      border-top-right-radius: var(--border-radius);
    }

    &--inactive {
      cursor: none;
    }

    &:not(.player--inactive):hover {
      .player-overlay {
        visibility: visible;
        opacity: 1;
      }
    }

    &--with-blur {
      /** Blurred static background */
      .player__thumbnail {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        filter: blur(20px);
        transform: scale(1.2);
        opacity: 0.4;
      }

      /** Blurred video background */
      .player__video-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: blur(30px);
        transform: scale(1.2);
        opacity: 0.4;
      }
    }

    &__loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;

      .loader {
        --size-main: 3rem;
        --size-border: 0.4rem;
      }
    }

    video {
      width: 100%;
      height: 100%;
      display: block;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
</style>
