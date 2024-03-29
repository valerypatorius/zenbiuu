<template>
  <div class="player-info">
    <!-- Ad duration -->
    <div
      v-if="isAdActive"
      class="player-info__message"
    >
      <icon name="Warning" />
      {{ t('player.ad') }}

      <timer
        v-if="adDuration"
        :duration="adDuration"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import Hls from 'hls.js';
import Icon from '@/src/modules/ui/components/Icon.vue';
import Timer from '@/src/modules/ui/components/Timer.vue';
import { parseFragTags } from '@/src/utils/m3u8';
import { useInterval } from '@/src/infrastructure/interval/useInterval';

const props = defineProps<{
  /** Hls instance */
  hls: Hls;
}>();

const { t } = useI18n();
const { start: startInterval } = useInterval();

/** Current ad quartile */
const adQuartileCurrent = ref<number>();

/** Total ad duration */
const adDuration = ref(0);

/** Function to stop ad duration interval */
const stopAdInterval = ref<() => void>();

/** True, if ad is detected */
const isAdActive = ref(false);

onMounted(() => {
  /**
   * Parse loaded framgents and search for ad tags.
   * If found, display message.
   *
   * Work in progress. Planning on bypassing ads after some research
   */
  props.hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
    const { tagList } = data.frag;
    const parsedTags = parseFragTags(tagList);
    const adStartTag = parsedTags.find((tag) => tag['EXT-X-DATERANGE'] && tag['EXT-X-DATERANGE'].CLASS === 'twitch-stitched-ad');
    const adQuartileTag = parsedTags.find((tag) => tag['EXT-X-DATERANGE'] && tag['EXT-X-DATERANGE'].CLASS === 'twitch-ad-quartile');

    if (!adStartTag && !adQuartileTag) {
      return;
    }

    if (adStartTag) {
      adDuration.value = parseFloat(adStartTag['EXT-X-DATERANGE'].DURATION);

      console.log('Ad is starting. Duration is', adDuration.value);

      isAdActive.value = true;

      stopAdInterval.value = startInterval(() => {
        console.log('Ad is ended');

        isAdActive.value = false;

        if (stopAdInterval.value !== undefined) {
          stopAdInterval.value();
          stopAdInterval.value = undefined;
        }
      }, adDuration.value * 1000);
    }

    if (adQuartileTag) {
      adQuartileCurrent.value = parseInt(adQuartileTag['EXT-X-DATERANGE']['X-TV-TWITCH-AD-QUARTILE'], 10);

      console.log('Current ad quartile', adQuartileCurrent.value, adQuartileTag['EXT-X-DATERANGE']);
    }
  });
});

onBeforeUnmount(() => {
  if (stopAdInterval.value) {
    stopAdInterval.value();
    stopAdInterval.value = undefined;
  }

  props.hls.off(Hls.Events.FRAG_LOADED);
});
</script>

<style lang="postcss">
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

    &__message {
      display: flex;
      align-items: center;
      font-weight: 500;
      gap: 1rem;
      background-color: var(--color-overlay-full);
      padding: 0.8rem 1.2rem;
      border-radius: 2rem;
      backdrop-filter: blur(20px);

      .icon {
        margin-top: 0.1rem;
      }
    }
  }
</style>
