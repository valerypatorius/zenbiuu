<template>
  <span>{{ duration }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import interval from '@/src/utils/interval';
import date from '@/src/utils/date';
import type { IntervalManagerItem } from '@/src/utils/interval';

/**
 * Duration update interval
 */
const UPDATE_INTERVAL = date.Minute;

export default defineComponent({
  name: 'Duration',
  props: {
    /**
     * Start time
     */
    start: {
      type: String,
      required: true,
    },
  },
  data (): {
    now: Date | null;
    interval: IntervalManagerItem | null;
    } {
    return {
      /**
       * Current time
       */
      now: null,

      /**
       * Duration update interval id
       */
      interval: null,
    };
  },
  computed: {
    /**
     * Formatted diff between start and current time
     */
    duration (): string {
      let result = '';

      if (!this.now) {
        return result;
      }

      const start = new Date(this.start);
      const diff = this.now.getTime() - start.getTime();
      const days = Math.floor((diff / date.Day));
      const hours = Math.floor((diff / date.Hour) % 24);
      const minutes = Math.floor((diff / date.Minute) % 60);

      if (days) {
        result += `${days}d `;
      }

      result += `${hours}:`;
      result += minutes < 10 ? `0${minutes}` : minutes;

      return result;
    },
  },
  mounted () {
    this.now = new Date();
    this.interval = interval.start(UPDATE_INTERVAL);

    this.interval.onupdate = () => {
      this.now = new Date();
    };
  },
  beforeUnmount () {
    if (this.interval) {
      interval.stop(this.interval);

      this.interval = null;
    }
  },
});
</script>
