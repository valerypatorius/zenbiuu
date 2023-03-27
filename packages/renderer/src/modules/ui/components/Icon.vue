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
import type { IconName } from './types';
import icons from '@/assets/icons';

const props = defineProps<{
  /** Icon name */
  name: IconName;
}>();

/** Svg html string */
const svg = computed(() => icons[props.name]);
</script>

<style lang="postcss">
  .icon {
    flex-shrink: 0;
    display: block;
    width: 1.6rem;
    color: inherit;
    position: relative;

    svg {
      fill: currentColor;
      display: block;
      width: 100%;
      height: auto;
      pointer-events: none;
      opacity: var(--icon-opacity, 1);
    }
  }
</style>
