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
import icons, { IconString } from '@/assets/icons';

const props = defineProps<{
  /** Icon name */
  name: string;
}>();

/** Svg html string */
const svg = computed<IconString>(() => icons[props.name]);
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
