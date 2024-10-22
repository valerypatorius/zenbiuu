<template>
  <div
    :class="[
      'titlebar',
      isSettingsOpened && 'titlebar--with-settings',
      app.isWindows && 'titlebar--windows',
      app.isMac && 'titlebar--mac',
    ]"
  >
    <div
      :class="[
        'titlebar__actions',
        isSidebarEnabled && 'titlebar__actions--with-sidebar'
      ]"
    >
      <div
        class="titlebar__button titlebar__button--settings"
        @click="toggleSettingsState()"
      >
        <Icon
          name="settings"
          :size="20"
        />
      </div>

      <div
        v-if="primaryAccount !== null"
        class="titlebar__button"
        @click="() => isSidebarEnabled = !isSidebarEnabled"
      >
        <Icon
          :name="isSidebarEnabled ? 'sidebarLeftCollapse' : 'sidebarRightCollapse'"
          :size="20"
        />
      </div>
    </div>

    <div
      v-show="openedChannels.length > 0"
      class="titlebar__button"
      @click="closeAllChannels()"
    >
      <Icon
        name="home"
        :size="20"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '~/components/ui/Icon';
import { useAccount } from '~/services/useAccount';
import { useHub } from '~/services/useHub';
import { useLibrary } from '~/services/useLibrary';
import { useSettings } from '~/services/useSettings';

const { app } = useHub();
const {
  state: isSettingsOpened,
  toggleState: toggleSettingsState,
  isSidebarEnabled,
} = useSettings();
const { primaryAccount } = useAccount();
const { closeAllChannels, openedChannels } = useLibrary();
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.titlebar {
  -webkit-app-region: drag;
  width: 100%;
  height: var(--layout-titlebar-height);
  display: flex;
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;

  &--with-settings {
    .titlebar__button:not(.titlebar__button--settings) {
      display: none;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;

    &--with-sidebar {
      width: var(--layout-left-sidebar-width);
    }
  }

  &__button {
    -webkit-app-region: no-drag;
    display: flex;
    padding: 0 16px;
    align-items: center;
    color: var(--theme-color-text-secondary);
    position: relative;

    &::before {
      --offset: 0;
      --border-radius: 0;
      content: '';
      background-color: rgba(255, 255, 255, 0.05);
      top: var(--offset);
      left: var(--offset);
      bottom: var(--offset);
      right: var(--offset);
      border-radius: var(--border-radius);
      position: absolute;
      opacity: 0;
    }

    &:hover {
      &::before {
        opacity: 1;
      }
    }
  }
}
</style>
