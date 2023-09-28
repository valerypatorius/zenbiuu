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
  name: keyof typeof icons;
}>();

const svg = computed(() => icons[props.name]);
</script>

<style lang="postcss">
.icon {
  flex-shrink: 0;
  display: block;

  svg {
    display: block;
    width: 100%;
    height: auto;
    pointer-events: none;
    opacity: var(--icon-opacity, 1);

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
