<template>
  <span class="timer">
    {{ displayedValue }}
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import date, { now } from '@/src/utils/date';

export default defineComponent({
  name: 'Timer',
  props: {
    /**
     * Duration in seconds
     */
    duration: {
      type: Number,
      required: true,
    },
  },
  data (): {
    value: number;
    prevTime: number;
    timer: ReturnType<typeof requestAnimationFrame> | null;
    } {
    return {
      /**
       * Timer value in ms
       */
      value: this.duration * date.Second,

      /**
       * Time of previous value update
       */
      prevTime: 0,

      /**
       * Id of animation frame request
       */
      timer: null,
    };
  },
  computed: {
    /**
     * Displayed value string
     */
    displayedValue (): string {
      return this.value ? Math.ceil(this.value / date.Second).toString() : '';
    },
  },
  mounted () {
    this.refresh();
  },
  beforeUnmount () {
    if (this.timer) {
      window.cancelAnimationFrame(this.timer);
    }
  },
  methods: {
    /**
     * See how much time left from previous update and decrease timer value
     */
    updateTimerValue (): void {
      const currentTime = now();
      const diff = this.prevTime ? currentTime - this.prevTime : 0;
      const nextValue = this.value - diff;

      this.value = nextValue > 0 ? nextValue : 0;
      this.prevTime = currentTime;
    },

    /**
     * Run updates
     */
    refresh (): void {
      this.timer = window.requestAnimationFrame(() => {
        this.updateTimerValue();

        if (this.value > 0) {
          this.refresh();
        }
      });
    },
  },
});
</script>
