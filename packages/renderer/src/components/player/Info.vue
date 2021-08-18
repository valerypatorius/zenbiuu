<template>
  <div class="player-info">
    <!-- Ad duration -->
    <div
      v-if="isAdActive"
      class="player-info__message"
    >
      <icon name="Warning" />
      {{ $t('player.ad') }}

      <timer
        v-if="adDuration"
        :duration="adDuration"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Hls from 'hls.js';
import Icon from '@/src/components/ui/Icon.vue';
import Timer from '@/src/components/ui/Timer.vue';
import { parseFragTags } from '@/src/utils/m3u8';
import interval from '@/src/utils/interval';
import type { IntervalManagerItem } from '@/src/utils/interval';
import type { HlsInstance } from '@/src/components/Player.vue';

export default defineComponent({
  name: 'PlayerInfo',
  components: {
    Icon,
    Timer,
  },
  props: {
    /**
     * Hls instance
     */
    hls: {
      type: Object,
      required: true,
    },
  },
  data (): {
    adQuartileCurrent: number | null;
    adDuration: number;
    adInterval: IntervalManagerItem | null;
    isAdActive: boolean;
    } {
    return {
      /**
       * Current ad quartile
       */
      adQuartileCurrent: null,

      /**
       * Total ad duration
       */
      adDuration: 0,

      /**
       * Ad duration interval
       */
      adInterval: null,

      /**
       * True, if ad is detected
       */
      isAdActive: false,
    };
  },
  mounted () {
    /**
     * Parse loaded framgents and search for ad tags.
     * If found, display message.
     *
     * Work in progress. Planning on bypassing ads after some research
     */
    (this.hls as HlsInstance).on(Hls.Events.FRAG_LOADED, (event, data) => {
      const { tagList } = data.frag;
      const parsedTags = parseFragTags(tagList);
      const adStartTag = parsedTags.find((tag) => tag['EXT-X-DATERANGE'] && tag['EXT-X-DATERANGE'].CLASS === 'twitch-stitched-ad');
      const adQuartileTag = parsedTags.find((tag) => tag['EXT-X-DATERANGE'] && tag['EXT-X-DATERANGE'].CLASS === 'twitch-ad-quartile');

      if (!adStartTag && !adQuartileTag) {
        return;
      }

      if (adStartTag) {
        this.adDuration = parseFloat(adStartTag['EXT-X-DATERANGE'].DURATION);

        console.log('Ad is starting. Duration is', this.adDuration);

        this.isAdActive = true;
        this.adInterval = interval.start(this.adDuration * 1000, false);

        this.adInterval.onupdate = () => {
          console.log('Ad is ended');

          this.isAdActive = false;

          if (this.adInterval) {
            interval.stop(this.adInterval);
            this.adInterval = null;
          }
        };
      }

      if (adQuartileTag) {
        this.adQuartileCurrent = parseInt(adQuartileTag['EXT-X-DATERANGE']['X-TV-TWITCH-AD-QUARTILE'], 10);

        console.log('Current ad quartile', this.adQuartileCurrent, adQuartileTag['EXT-X-DATERANGE']);
      }
    });
  },
  beforeUnmount () {
    if (this.adInterval) {
      interval.stop(this.adInterval);
      this.adInterval = null;
    }

    (this.hls as HlsInstance).off(Hls.Events.FRAG_LOADED);
  },
});
</script>

<style>
  .player-info {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: var(--offset-window);
  }

  .player-info__message {
    display: flex;
    align-items: center;
    font-weight: 500;
    gap: 1rem;
    background-color: var(--color-overlay-full);
    padding: 0.8rem 1.2rem;
    border-radius: 2rem;
    backdrop-filter: blur(20px);
  }

  .player-info__message .icon {
    margin-top: 0.1rem;
  }
</style>
