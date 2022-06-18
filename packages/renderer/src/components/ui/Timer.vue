<template>
  <span class="timer">
    {{ displayedValue }}
  </span>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue';
import date, { now } from '@/src/utils/date';

const props = defineProps<{
  /** Duration in seconds */
  duration: number;
}>();

/** Timer value in ms */
const currentValue = ref(props.duration * date.Second);

/** Time of previous value update */
const prevTime = ref(0);

/** Id of animation frame request */
const timer = ref<ReturnType<typeof requestAnimationFrame> | null>(null);

/** Displayed value string */
const displayedValue = computed(() => currentValue.value ? Math.ceil(currentValue.value / date.Second).toString() : '');

/** See how much time left from previous update and decrease timer value */
function updateTimerValue () {
  const currentTime = now();
  const diff = prevTime.value ? currentTime - prevTime.value : 0;
  const nextValue = currentValue.value - diff;

  currentValue.value = nextValue > 0 ? nextValue : 0;
  prevTime.value = currentTime;
}

/** Run updates */
function run () {
  timer.value = window.requestAnimationFrame(() => {
    updateTimerValue();

    if (currentValue.value > 0) {
      run();
    }
  });
}

onMounted(() => {
  run();
});

onBeforeUnmount(() => {
  if (timer.value) {
    window.cancelAnimationFrame(timer.value);
    timer.value = null;
  }
});
</script>
