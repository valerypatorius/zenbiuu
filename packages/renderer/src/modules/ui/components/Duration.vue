<template>
  <span>{{ duration }}</span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import date from '@/src/utils/date';
import { useInterval } from '@/src/infrastructure/interval/useInterval';

const props = defineProps<{
  /** Start time */
  start: string;
}>();

const { start: startInterval } = useInterval();

/** Duration update interval */
const UPDATE_INTERVAL = date.Minute;

/** Current time */
const now = ref<Date>();

/** Function to stop update interval */
const stopUpdateInterval = ref<() => void>();

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

  stopUpdateInterval.value = startInterval(() => {
    now.value = new Date();
  }, UPDATE_INTERVAL, {
    immediate: true,
  });
});

onBeforeUnmount(() => {
  if (stopUpdateInterval.value !== undefined) {
    stopUpdateInterval.value();
    stopUpdateInterval.value = undefined;
  }
});
</script>
