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
      ref="videoBackground"
      :width="videoBackground.width"
      :height="videoBackground.height"
      class="player__video-background"
    />

    <!-- Loader -->
    <div
      v-if="!isVideoReady && !isOffline"
      class="player__loader"
    >
      <loader />
    </div>

    <!-- Video player -->
    <video
      v-show="isVideoReady"
      ref="video"
    />

    <!-- Overlay with controls -->
    <player-overlay
      v-if="isVideoReady && !isOffline"
      :elements="playerElements"
      :stream-info="info"
      :current-volume="currentVolume"
      :channel-name="channelName"
      :is-sidebar-hidden="isSidebarHidden"
      :is-chat-hidden="isChatHidden"
      :quality-levels="qualityLevels"
      @change-quality="onQualityChange"
      @control-mouse-enter="onControlMouseEnter"
      @control-mouse-leave="onControlMouseLeave"
    />

    <!-- Additional info messages -->
    <player-info
      v-if="isVideoReady && hls"
      :hls="hls"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as actions from '@/src/store/actions';
import interval from '@/src/utils/interval';
import date from '@/src/utils/date';
import Hls, { HlsConfig } from 'hls.js';
import { StreamType, TwitchStream } from '@/types/renderer/library';
import Loader from '@/src/components/ui/Loader.vue';
import PlayerOverlay from '@/src/components/player/Overlay.vue';
import PlayerInfo from '@/src/components/player/Info.vue';
import type { Level } from 'hls.js';
import type { IntervalManagerItem } from '@/src/utils/interval';
import type { PlayerElements } from '@/types/renderer/player';

export type HlsInstance = InstanceType<typeof Hls>;

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

export default defineComponent({
  name: 'Player',
  components: {
    Loader,
    PlayerOverlay,
    PlayerInfo,
  },
  props: {
    /**
     * Current channel name
     */
    channelName: {
      type: String,
      required: true,
    },

    /**
     * Current channel id
     */
    channelId: {
      type: String,
      required: true,
    },

    /**
     * Initial video cover
     */
    cover: {
      type: String,
      default: '',
    },
  },
  data (): {
    hls: HlsInstance | null;
    isVideoReady: boolean;
    qualityLevels: Level[];
    statsInterval: IntervalManagerItem | null;
    videoBackgroundInterval: ReturnType<typeof requestAnimationFrame> | null;
    videoBackground: {
      width: number;
      height: number;
    };
    inactivityInterval: ReturnType<typeof setTimeout> | null;
    isInactive: boolean;
    isOffline: boolean;
    isControlHovered: boolean;
    playerElements: Partial<PlayerElements>;
    } {
    return {
      /**
       * Hls instance
       */
      hls: null,

      /**
       * Is video ready to play
       */
      isVideoReady: false,

      /**
       * Raw quality levels list
       */
      qualityLevels: [],

      /**
       * Stats interval object
       */
      statsInterval: null,

      /**
       * Video background update interval object
       */
      videoBackgroundInterval: null,

      /**
       * Video background dimensions
       */
      videoBackground: {
        width: 640,
        height: 360,
      },

      /**
       * Inactivity interval id
       */
      inactivityInterval: null,

      /**
       * If true, interface and cursor will be hidden
       */
      isInactive: false,

      /**
       * True, when both playlist and stream info are not available
       */
      isOffline: false,

      /**
       * True, if overlay control is hovered.
       * Disables inactivity watcher
       */
      isControlHovered: false,

      /**
       * DOM-elements, which properties are modified
       * by player and its child components
       */
      playerElements: {},
    };
  },
  computed: {
    /**
     * Returns true, if interface blur is enabled in settings
     */
    isBlurEnabled (): boolean {
      return this.$store.state.app.settings.isBlurEnabled;
    },

    /**
     * Returns true, if sidebar is hidden by user
     */
    isSidebarHidden (): boolean {
      return this.$store.state.player.isHideSidebar;
    },

    /**
     * Returns true, if sidebar is chat by user
     */
    isChatHidden (): boolean {
      return this.$store.state.player.isHideChat;
    },

    /**
     * Current volume value
     */
    currentVolume (): number {
      return this.$store.state.player.volume;
    },

    /**
     * Returns true, if channel is followed
     */
    isFollowed (): boolean {
      return !!this.$store.state.library.followed.find((item) => item.to_id === this.channelId.toString());
    },

    /**
     * Stream info
     */
    info (): TwitchStream | undefined {
      const streamType = this.isFollowed ? StreamType.Followed : StreamType.Found;

      return this.$store.state.library.streams[streamType].find((stream) => stream.user_login === this.channelName);
    },

    /**
     * Stream thumbnail url
     */
    thumbnail (): string {
      if (this.cover) {
        return this.cover;
      }

      if (!this.info) {
        return '';
      }

      const { lastUpdateTime } = this.$store.state.library;

      return `${this.info.thumbnail_url.replace(/\{width\}/, '640').replace(/\{height\}/, '360')}?v=${lastUpdateTime}`;
    },
  },
  mounted () {
    /**
     * Save rendered elements
     */
    this.playerElements.player = this.$refs.player as HTMLElement;
    this.playerElements.video = this.$refs.video as HTMLVideoElement;
    this.playerElements.videoBackground = this.$refs.videoBackground as HTMLCanvasElement;

    /**
     * Update stream info and send player stats every 1 minute
     */
    this.statsInterval = interval.start(STATS_POST_FREQUENCY);

    this.statsInterval.onupdate = () => {
      if (this.info) {
        this.$store.dispatch(actions.SEND_PLAYER_STATS, this.info);
      }

      this.$store.dispatch(actions.REQUEST_STREAM_INFO, {
        channel: this.channelName,
        streamType: this.isFollowed ? StreamType.Followed : StreamType.Found,
      }).catch(() => {
        this.isOffline = true;
      });
    };

    /**
     * Start playback
     */
    this.initPlayer();
    this.loadPlaylist(this.channelName);
  },
  beforeUnmount () {
    /**
     * Stop watching for cursor
     */
    if (this.inactivityInterval) {
      clearTimeout(this.inactivityInterval);
      this.inactivityInterval = null;
    }

    /**
     * Stop sending stats
     */
    if (this.statsInterval) {
      interval.stop(this.statsInterval);

      this.statsInterval = null;
    }

    /**
     * Stop updating video background
     */
    if (this.videoBackgroundInterval) {
      cancelAnimationFrame(this.videoBackgroundInterval);
      this.videoBackgroundInterval = null;
    }

    /**
     * Destroy player
     */
    if (this.hls) {
      this.hls.off(Hls.Events.MEDIA_ATTACHED);
      this.hls.off(Hls.Events.MANIFEST_PARSED);
      this.hls.off(Hls.Events.INIT_PTS_FOUND);
      this.hls.destroy();
      this.hls = null;
    }
  },
  methods: {
    /**
     * When quality is changed via picker,
     * set next video fragment quality
     */
    onQualityChange (index: number): void {
      if (!this.hls) {
        return;
      }

      this.hls.nextLevel = index;
    },

    /**
     * Initialize player without requesting media source
     */
    initPlayer (): void {
      const { video } = this.playerElements;

      if (this.hls || !video) {
        return;
      }

      video.volume = this.currentVolume;

      this.hls = new Hls(HLS_CONFIG);
      this.hls.attachMedia(video);

      /**
       * Wait for source
       */
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls?.on(Hls.Events.MANIFEST_PARSED, () => {
          this.qualityLevels = this.hls?.levels ?? [];

          video.play();
        });

        this.hls?.on(Hls.Events.INIT_PTS_FOUND, () => {
          this.isVideoReady = true;

          this.initVideoBackground();
        });
      });

      /**
       * Handle errors
       */
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
          this.isOffline = true;
        }
      });
    },

    /**
     * Load playlist and pass it to hls
     */
    loadPlaylist (channel: string, headers = {}): void {
      this.$store.dispatch(actions.REQUEST_CHANNEL_PLAYLIST, {
        channel,
        headers,
      }).then((url) => {
        this.hls?.loadSource(url);
      });
    },

    /**
     * Initialize video background
     */
    initVideoBackground (): void {
      this.videoBackgroundInterval = window.requestAnimationFrame(this.updateVideoBackground);
    },

    /**
     * Update video background via canvas image (if allowed by settings)
     */
    updateVideoBackground (): void {
      if (!this.isBlurEnabled) {
        this.videoBackgroundInterval = null;

        return;
      }

      const { video, videoBackground } = this.playerElements;

      if (!video || !videoBackground) {
        return;
      }

      const { width, height } = this.videoBackground;
      const ctx = videoBackground.getContext('2d');

      if (!ctx) {
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);

      this.videoBackgroundInterval = window.requestAnimationFrame(this.updateVideoBackground);
    },

    /**
     * Force mousemove handler to handle some cases
     * (e.g. when user comes from library screen without moving cursor)
     */
    onMouseEnter (): void {
      this.onMouseMove();
    },

    /**
     * Enable inactive state, if mouse is not moving
     */
    onMouseMove (): void {
      if (this.isControlHovered) {
        return;
      }

      this.disableInactivityWatcher();

      this.inactivityInterval = setTimeout(() => {
        this.isInactive = true;
      }, INACTIVITY_DELAY);
    },

    /**
     * Disable player inactive state
     */
    onMouseLeave (): void {
      this.disableInactivityWatcher();
    },

    /**
     * Stop watching for inactive state
     */
    disableInactivityWatcher (): void {
      this.isInactive = false;

      if (this.inactivityInterval) {
        clearTimeout(this.inactivityInterval);
      }
    },

    /**
     * When overlay control is hovered,
     * disable inactivity watcher
     */
    onControlMouseEnter (): void {
      this.isControlHovered = true;

      this.disableInactivityWatcher();
    },

    /**
     * When overlay control is not hovered,
     * resume inactivity watcher
     */
    onControlMouseLeave (): void {
      this.isControlHovered = false;

      this.onMouseMove();
    },
  },
});
</script>

<style>
  .player {
    position: relative;
    overflow: hidden;
    background-color: var(--color-overlay-full);
  }

  .player--with-sidebar {
    border-top-left-radius: var(--border-radius);
  }

  .player--with-chat {
    border-top-right-radius: var(--border-radius);
  }

  .player--inactive {
    cursor: none;
  }

  .player:not(.player--inactive):hover .player-overlay {
    visibility: visible;
    opacity: 1;
  }

  .player__loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  .player__loader .loader {
    --size-main: 3rem;
    --size-border: 0.4rem;
  }

  .player video {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  }

  /** Blurred static background */
  .player--with-blur .player__thumbnail {
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
  .player--with-blur .player__video-background {
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
</style>
