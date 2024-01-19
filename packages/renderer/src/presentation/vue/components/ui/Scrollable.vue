<template>
  <div
    ref="root"
    class="scrollable"
    data-overlayscrollbars-initialize
  >
    <div
      v-if="isScrollbarReady"
      ref="horizon"
      class="scrollable__horizon scrollable__horizon--top"
    />

    <div
      v-show="isScrolled"
      class="scrollable__shadow scrollable__shadow--top"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { onMounted, ref } from 'vue';
import { useOverlayScrollbars } from 'overlayscrollbars-vue';

const root = ref<HTMLElement | null>(null);

const horizon = ref<HTMLElement | null>(null);

const isScrollbarReady = ref(false);

const isScrolled = ref(false);

/**
 * @todo Deal with scrollbar blinking on fast chat updates
 */

const [initialize] = useOverlayScrollbars({
  defer: true,
  options: {
    update: {
      /**
       * Images space is reserved, so no need to update on load
       */
      elementEvents: null,

      /**
       * Disable debounce, as it messes with scrollIntoView
       */
      debounce: null,
    },
    scrollbars: {
      theme: 'os-theme-custom',
      autoHide: 'leave',
      autoHideDelay: 0,
    },
  },
  events: {
    updated: () => {
      isScrollbarReady.value = true;
    },
  },
});

useIntersectionObserver(horizon, ([{ isIntersecting }]) => {
  isScrolled.value = isIntersecting === false;
});

onMounted(() => {
  if (root.value !== null) {
    initialize(root.value);
  }
});
</script>

<style lang="postcss">
.scrollable {
  position: relative;
  min-height: 100%;

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

  .os-theme-custom {
    --os-size: 12px;
    --os-padding-perpendicular: 1px;
    --os-padding-axis: 1px;
    --os-handle-border-radius: var(--os-size);
    --os-handle-bg: var(--theme-scrollbar-color);
    --os-handle-bg-hover: var(--theme-scrollbar-color);
    --os-handle-bg-active: var(--theme-scrollbar-color);
    --os-handle-perpendicular-size: 50%;
  }
}
</style>
