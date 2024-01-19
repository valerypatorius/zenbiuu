<template>
  {{ duration }}
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import date from '@/utils/date';
import { createInterval } from '@/interval/index';

const props = defineProps<{
  dateStart: string | number;
}>();

const dateNow = ref<Date>();

const duration = computed(() => {
  if (dateNow.value === undefined) {
    return '00:00';
  }

  const start = new Date(props.dateStart);
  const diff = dateNow.value.getTime() - start.getTime();
  const hours = Math.floor((diff / date.Hour));
  const minutes = Math.floor((diff / date.Minute) % 60);

  const displayedHours = hours < 10 ? `0${hours}` : hours;
  const displayedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${displayedHours}:${displayedMinutes}`;
});

let stopInterval: (() => void) | undefined;

onMounted(() => {
  stopInterval = createInterval(() => {
    dateNow.value = new Date();
  }, date.Minute, {
    immediate: true,
  });
});

onBeforeUnmount(() => {
  stopInterval?.();
  stopInterval = undefined;
});
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.duration {
  @extend %text-small;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(0, 0, 0, 0.9);
  padding: 2px 8px 2px 5px;
  border-radius: 32px;
}
</style>
