<template>
  <div
    :class="[
      'titlebar',
      {
        'titlebar--win': isWindowsBehavior,
        'titlebar--mac': !isWindowsBehavior,
      },
    ]"
  >
    <!-- Top window resizer -->
    <div class="titlebar__resizer titlebar__resizer--top" />

    <!-- Left window resizer -->
    <div class="titlebar__resizer titlebar__resizer--left" />

    <!-- Loader -->
    <Loader v-if="isLoading" />

    <div class="titlebar__main">
      <div
        v-if="isSidebarHidden && !isLibrary"
        class="titlebar__title titlebar__title--clickable"
        @click="openLibrary"
      >
        {{ $t('router.library') }}

        <icon name="ChevronRight" />
      </div>

      <div class="titlebar__title">
        {{ title }}
      </div>
    </div>

    <!-- Window controls (win32 only) -->
    <div
      v-if="isWindowsBehavior"
      class="titlebar__controls"
    >
      <WindowControls />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInterface } from '@/src/infrastructure/interface/useInterface';
import { isWindows } from '@/src/utils/utils';
import Icon from '@/src/modules/ui/components/Icon.vue';
import Loader from '@/src/modules/ui/components/Loader.vue';
import WindowControls from '@/src/modules/ui/components/WindowControls.vue';
import { getWindowTitle } from '@/src/router/index';
import { RouteName } from '@/types/renderer/router';
import { usePlayer } from '@/src/store/usePlayer';

/**
 * Define store and router instances
 */
const route = useRoute();
const router = useRouter();
const { isLoading } = useInterface();
const { state: playerState } = usePlayer();

/** Window title, based on current route */
const title = computed(() => getWindowTitle(route));

/** True, if current platform is Windows */
const isWindowsBehavior = isWindows();

/** True, if current route is "library" */
const isLibrary = computed(() => route.name === RouteName.Library);

/** True, if sidebar is hidden by user" */
const isSidebarHidden = computed(() => playerState.isHideSidebar);

/** Open Library screen */
const openLibrary = () => {
  if (!isLibrary.value) {
    router.replace({ name: RouteName.Library });
  }
};
</script>

<style>
  .titlebar {
    height: var(--height-titlebar);
    display: flex;
    justify-content: center;
    -webkit-app-region: drag;
    position: relative;
    z-index: 1001;
  }

  .titlebar__main {
    position: relative;
    display: flex;
    justify-content: center;
    line-height: 0;
    margin-top: -0.1rem;
  }

  .titlebar .loader {
    --size-main: 1.4rem;
    --size-border: 0.2rem;

    align-self: center;
    position: absolute;
  }

  .titlebar--win .loader {
    left: 2.2rem;
  }

  .titlebar--mac .loader {
    right: 2.2rem;
  }

  .titlebar__title {
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
  }

  .titlebar__title .icon {
    margin: 0 0.6rem;
    margin-top: 0.2rem;
    color: var(--color-text-tertiary);
  }

  .titlebar__title--clickable {
    -webkit-app-region: no-drag;
    cursor: pointer;
  }

  .titlebar__title--clickable:hover {
    color: var(--color-text);
  }

  .titlebar__resizer {
    position: absolute;
    top: 0;
    left: 0;
    -webkit-app-region: no-drag;
  }

  .titlebar__resizer--top {
    width: 100%;
    height: 5px;
  }

  .titlebar__resizer--left {
    width: 5px;
    height: 100%;
  }

  .titlebar__controls {
    -webkit-app-region: no-drag;
    height: 100%;
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
  }
</style>
