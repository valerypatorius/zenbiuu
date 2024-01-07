<template>
  <div
    :class="[
      'icon',
      'icon--' + name,
    ]"
    v-html="svg"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import icons from '@/assets/icons';

const props = defineProps<{
  name?: keyof typeof icons;
  raw?: string;
  size?: number;
}>();

const svg = computed(() => props.name !== undefined ? icons[props.name] : (props.raw ?? ''));
</script>

<style lang="postcss">
.icon {
  --size: v-bind('size + "px"');
  width: var(--size);
  height: var(--size);
  flex-shrink: 0;
  display: block;

  svg {
    display: block;
    width: 100%;
    height: auto;
    pointer-events: none;

    /* By default inherit text color for fill */
    fill: currentColor;

    /* If stroke width is set, inherit text color for stroke */
    &[stroke-width] {
      fill: none;
      stroke: currentColor;
    }
  }
}
</style>
