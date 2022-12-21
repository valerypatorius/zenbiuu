<template>
  <div
    :class="[
      'light',
      !isOutside && 'light--active'
    ]"
    :style="style"
  />
</template>

<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core';
import { computed } from 'vue';

const props = defineProps<{
  parent: HTMLElement;
  size: number;
}>();

const { elementX, elementY, isOutside } = useMouseInElement(props.parent, {
  handleOutside: false,
});

const style = computed(() => {
  return {
    '--x': `${elementX.value}px`,
    '--y': `${elementY.value}px`,
    '--size': `${props.size}rem`,
  };
});

</script>

<style lang="postcss">
.light {
  background-color: var(--color-light, var(--color-text));
  width: 1px;
  height: 1px;
  box-shadow: 0 0 var(--size) var(--size) var(--color-light);
  position: absolute;
  top: var(--y, 0);
  left: var(--x, 0);
  transform: translate3d(-50%, -50%, 0);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.13s ease-in-out;

  &--active {
    opacity: 1;
  }
}
</style>
