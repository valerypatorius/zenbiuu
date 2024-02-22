<template>
  <TitleBar
    :is-stream-active="openedChannels.length > 0"
    :is-sidebar-active="isSidebarActive"
    :is-settings-active="isSettingsOpened"
    :is-can-toggle-sidebar="primaryAccount !== null"
    @go-home="closeAllChannels()"
    @toggle-settings="toggleSettingsState()"
    @toggle-left-sidebar="isSidebarActive = !isSidebarActive"
  />

  <main>
    <Library
      v-if="primaryAccount !== null"
      :is-sidebar-active="isSidebarActive"
    />

    <Auth v-else />
  </main>

  <Settings v-if="isSettingsOpened" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAccount } from '../services/useAccount';
import { useSettings } from '../services/useSettings';
import { useLibrary } from '../services/useLibrary';
import TitleBar from './Titlebar.vue';
import Auth from './Auth.vue';
import Settings from './Settings.vue';
import Library from './Library.vue';
import 'overlayscrollbars/overlayscrollbars.css';

const { primaryAccount } = useAccount();
const { state: isSettingsOpened, toggleState: toggleSettingsState } = useSettings();
const { closeAllChannels, openedChannels } = useLibrary();

const isSidebarActive = ref(true);
</script>

<style lang="postcss">
@import '@/presentation/styles/reset.pcss';
@import '@/presentation/styles/themes.pcss';
@import '@/presentation/styles/typography.pcss';
@import '@/presentation/styles/layout.pcss';

::selection {
  color: var(--theme-color-button-text);
  background-color: var(--theme-color-button-background);
}

body {
  @extend %text-default;
  background-color: var(--theme-color-background);
  color: var(--theme-color-text);
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
  word-break: break-word;
  overflow: hidden;
}

main {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
}
</style>
