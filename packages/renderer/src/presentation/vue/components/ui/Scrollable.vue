<template>
  <div
    ref="root"
    class="scrollable"
  >
    <div
      v-show="!arrivedState.top"
      class="scrollable__shadow scrollable__shadow--top"
    />

    <slot />

    <!-- <div
      v-show="!arrivedState.bottom"
      class="scrollable__shadow scrollable__shadow--bottom"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { useScroll } from '@vueuse/core';
import { ref } from 'vue';

const root = ref<HTMLElement>();

/**
 * @todo Think about using intersection observer
 */
const { arrivedState } = useScroll(root);
</script>

<style lang="postcss">
.scrollable {
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  min-height: 100%;
  /* -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%); */

  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border: 4px solid transparent;
    background-clip: content-box;
    border-radius: 12px;

    &:hover {
      border-width: 2px;
    }
  }

  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.03);
    }
  }

  &__shadow {
    position: sticky;
    left: 0;
    width: 100%;
    height: 0;
    z-index: 1;

    &::before {
      content: '';
      display: block;
      width: 90%;
      height: 12px;
      border-radius: 100%;
      box-shadow: 0 var(--shadow-offset-y) 20px rgba(0, 0, 0, 0.3);
      position: absolute;
      top: var(--offset-y);
      left: 50%;
      transform: translateX(-50%);
    }

    &--top {
      --offset-y: -12px;
      --shadow-offset-y: 4px;
      top: 0;
    }

    &--bottom {
      --offset-y: 0;
      --shadow-offset-y: -4px;
      bottom: 0;
    }
  }
}
</style>
