<template>
  <div
    :class="[
      'titlebar',
      {
        'titlebar--win': isWindows,
        'titlebar--mac': !isWindows,
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
      v-if="isWindows"
      class="titlebar__controls"
    >
      <WindowControls />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { isWindows } from '@/src/utils/utils';
import Icon from '@/src/components/ui/Icon.vue';
import Loader from '@/src/components/ui/Loader.vue';
import WindowControls from '@/src/components/ui/WindowControls.vue';
import { getWindowTitle } from '@/src/router/index';
import { RouteName } from '@/types/renderer/router';

export default defineComponent({
  name: 'TitleBar',
  components: {
    Icon,
    Loader,
    WindowControls,
  },
  data (): {
    isWindows: boolean;
    } {
    return {
      /**
       * Is current platform Windows or not
       */
      isWindows: isWindows(),
    };
  },
  computed: {
    /**
     * Window title
     */
    title (): string {
      return getWindowTitle(this.$route);
    },

    /**
     * Returns true, if app is loading something
     */
    isLoading (): boolean {
      return this.$store.state.app.isLoading;
    },

    /**
     * Returns true, if current route is "library"
     */
    isLibrary (): boolean {
      return this.$route.name === RouteName.Library;
    },

    /**
     * Returns true, if sidebar is hidden by user
     */
    isSidebarHidden (): boolean {
      return this.$store.state.player.isHideSidebar;
    },
  },
  methods: {
    /**
     * Open Library screen
     */
    openLibrary (): void {
      if (!this.isLibrary) {
        this.$router.replace({ name: 'Library' });
      }
    },
  },
});
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
