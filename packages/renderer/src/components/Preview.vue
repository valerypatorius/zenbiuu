<template>
  <div
    :class="[
      'preview',
      {
        'preview--loading': isLoading,
      },
    ]"
    @mousedown="onClick"
  >
    <div
      class="preview__screen"
      :style="{
        backgroundImage: `url(${prevCover || latestCover}), url(${loadedCover || latestCover})`,
      }"
    >
      <div class="preview__counters">
        <!-- Viewers counter -->
        <div
          :class="[
            'preview__counter',
            {
              'preview__counter--with-blur': isBlurEnabled,
            },
          ]"
        >
          <icon name="User" />

          <span>{{ viewersCount }}</span>
        </div>

        <!-- Duration counter -->
        <div
          :class="[
            'preview__counter',
            {
              'preview__counter--with-blur': isBlurEnabled,
            },
          ]"
        >
          <icon name="Time" />

          <duration :start="data.started_at" />
        </div>
      </div>
    </div>

    <!-- Stream title -->
    <div class="preview__title">
      {{ data.title }}
    </div>

    <div class="preview-channel">
      <!-- Channel image -->
      <div class="preview-channel__logo">
        <img
          v-if="channelLogo"
          :src="channelLogo"
          loading="lazy"
          alt=""
        >
      </div>

      <div class="preview-channel__info">
        <!-- Channel name -->
        <div class="preview-channel__line">
          {{ data.user_name }}
        </div>

        <!-- Current game -->
        <div class="preview-channel__line">
          {{ data.game_name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';
import Duration from '@/src/components/Duration.vue';
import type { TwitchStream } from '@/types/renderer/library';

export default defineComponent({
  name: 'Preview',
  components: {
    Icon,
    Duration,
  },
  props: {
    /**
     * Stream data object
     */
    data: {
      type: Object as PropType<TwitchStream>,
      default: () => ({}),
    },

    /**
     * If true, preview is displayed as loading
     */
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  data (): {
    prevCover: string | null;
    loadedCover: string | null;
    } {
    return {
      /**
       * Previous cover url
       */
      prevCover: null,

      /**
       * Cover url, loaded and ready for display
       */
      loadedCover: null,
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
     * Viewers count, formatted
     */
    viewersCount (): string {
      return this.data.viewer_count.toLocaleString();
    },

    /**
     * Latest cover url, not ready for display
     */
    latestCover (): string {
      const { lastUpdateTime } = this.$store.state.library;

      return `${this.data.thumbnail_url.replace(/\{width\}/, '640').replace(/\{height\}/, '360')}?v=${lastUpdateTime}`;
    },

    /**
     * Channel logo image
     */
    channelLogo (): string {
      const { users } = this.$store.state.library;
      const data = users.find((user) => user.id === this.data.user_id);

      return data ? data.profile_image_url : '';
    },
  },
  watch: {
    /**
     * Watch for cover url timestamp change and reload image
     */
    latestCover (newCover: string, prevCover: string): void {
      const image = new Image();

      this.prevCover = prevCover;

      image.onload = () => {
        this.loadedCover = newCover;
      };

      image.src = newCover;
    },
  },
  methods: {
    /**
     * Emit click event with channel name
     */
    onClick (): void {
      this.$emit('click', this.data.user_name, this.data.user_id, this.latestCover);
    },
  },
});
</script>

<style>
  .preview {
    cursor: pointer;
    position: relative;
  }

  .preview--loading {
    pointer-events: none;
    filter: grayscale(1);
    opacity: 0.2;
  }

  .preview:hover .preview__screen {
    filter: brightness(1.15);
  }

  .preview__screen {
    width: 100%;
    background-color: var(--color-overlay-full);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: cover;
    border-radius: var(--border-radius);
    position: relative;
    margin-bottom: 1.5rem;
  }

  .preview__screen::before {
    content: '';
    display: block;
    padding-bottom: var(--ratio-video);
  }

  .preview__screen::after {
    content: '';
    width: 100%;
    height: 100%;
    background-image: linear-gradient(-160deg, transparent 40%, rgba(var(--rgb-white), 1) 100%);
    opacity: 0.15;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: var(--border-radius);
  }

  .preview__counters {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.75rem;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .preview__counter {
    font-size: 1.3rem;
    line-height: 1em;
    background-color: var(--color-overlay);
    color: var(--color-text-secondary);
    padding: 0.7rem 0.9rem;
    border-radius: 10rem;
    display: flex;
    align-items: center;
  }

  .preview__counter--with-blur {
    backdrop-filter: blur(15px);
  }

  .preview__counter:last-child {
    margin-left: auto;
    margin-right: 0;
  }

  .preview__counter .icon {
    width: 1.1rem;
    margin-right: 0.44rem;
  }

  .preview__counter .icon--time {
    margin-left: -0.2rem;
  }

  .preview__counter span {
    line-height: 0;
    margin-top: -1px;
  }

  .preview__title {
    font-size: 1.6rem;
    line-height: 1.5em;
    font-weight: 500;
  }

  .preview .preview-channel {
    margin-top: 1.1rem;
  }

  .preview-channel {
    display: flex;
    align-items: center;
  }

  .preview-channel__logo {
    flex-shrink: 0;
    width: 3.2rem;
    height: 3.2rem;
    margin-right: 1.2rem;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    background-color: var(--color-overlay-full);
  }

  .preview-channel__logo::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  .preview-channel__logo img {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .preview-channel__info {
    min-width: 0;
    color: var(--color-text-secondary);
  }

  .preview-channel__line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
