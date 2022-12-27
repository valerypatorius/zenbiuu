<template>
  <div class="window-controls">
    <!-- Minimize window -->
    <div
      class="window-control window-control--minimize"
      @click="callWindowMethod(Method.Minimize)"
    >
      <icon name="WindowMinimize" />
    </div>

    <!-- (Un)maximize window -->
    <div
      class="window-control window-control--maximize"
      @click="callWindowMethod(isMaximized ? Method.Unmaximize : Method.Maximize)"
    >
      <icon :name="isMaximized ? 'WindowUnmaximize' : 'WindowMaximize'" />
    </div>

    <!-- Close window -->
    <div
      class="window-control window-control--close"
      @click="callWindowMethod(Method.Close)"
    >
      <icon name="WindowClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { callWindowMethod } from '@/src/infrastructure/hub/hub';
import Icon from '@/src/modules/ui/components/Icon.vue';
import { useHub } from '@/src/store/useHub';

/**
 * Available window methods
 */
 enum Method {
  Minimize = 'minimize',
  Maximize = 'maximize',
  Unmaximize = 'unmaximize',
  Close = 'close',
}

const { state: hubState } = useHub();

/** Returns current maximized state of app window */
const isMaximized = computed(() => hubState.isAppWindowMaximized);
</script>

<style>
  .window-controls {
    display: flex;
  }

  .window-control {
    --width: 46px;

    width: var(--width);
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .window-control .icon {
    --size: 11px;

    width: var(--size);
    height: var(--size);
  }

  .window-control:not(.window-control--close) svg {
    shape-rendering: crispEdges;
  }

  .window-control:hover {
    background-color: var(--color-control-active);
    color: var(--color-text);
  }

  .window-control--close:hover {
    background-color: rgba(var(--rgb-red), 1);
    color: rgba(var(--rgb-white), 1);
  }
</style>
