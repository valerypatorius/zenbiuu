<template>
  <span>{{ duration }}</span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import intervalManager from '@/src/utils/interval';
import date from '@/src/utils/date';
import type { IntervalManagerItem } from '@/src/utils/interval';

const props = defineProps<{
  /** Start time */
  start: string;
}>();

/** Duration update interval */
const UPDATE_INTERVAL = date.Minute;

/** Current time */
const now = ref<Date>();

/** Duration update interval id */
const interval = ref<IntervalManagerItem>();

/** Formatted diff between start and current time */
const duration = computed<string>(() => {
  let result = '';

  if (!now.value) {
    return result;
  }

  const start = new Date(props.start);
  const diff = now.value.getTime() - start.getTime();
  const days = Math.floor((diff / date.Day));
  const hours = Math.floor((diff / date.Hour) % 24);
  const minutes = Math.floor((diff / date.Minute) % 60);

  if (days) {
    result += `${days}d `;
  }

  result += `${hours}:`;
  result += minutes < 10 ? `0${minutes}` : minutes;

  return result;
});

onMounted(() => {
  now.value = new Date();
  interval.value = intervalManager.start(UPDATE_INTERVAL);

  interval.value.onupdate = () => {
    now.value = new Date();
  };
});

onBeforeUnmount(() => {
  if (interval.value) {
    intervalManager.stop(interval.value);

    interval.value = undefined;
  }
});
</script>
