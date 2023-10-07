<template>
  <TitleBar />

  <main>
    <Settings />

    <Library v-if="hasPrimaryAccount" />

    <Auth v-else />
  </main>
</template>

<script setup lang="ts">
import { useAccount } from '../services/useAccount';
import TitleBar from './Titlebar.vue';
import Auth from './Auth.vue';
import Settings from './Settings.vue';
import Library from './Library.vue';

const { hasPrimaryAccount } = useAccount();

// const route = useRoute();
// const { isSettingsActive } = useInterface();
// const { state: appState } = useApp();
// const { state: userState } = useUser();
// const { check: checkUpdates } = useUpdater();
// const { onUserStateUpdated: onIrcUserStateUpdated } = useIrc();
// const { getCommonEmotes } = useEmotes();

// /** Check for app updates */
// checkUpdates();

// /** When IRC user state is updated, request common emotes */
// onIrcUserStateUpdated((state) => {
//   getCommonEmotes(state.emoteSets);
// });
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
  grid-template-rows: auto minmax(0, 1fr);
}

main {
  display: grid;
  place-items: center;
  overflow: auto;
  padding: 20px;
  position: relative;
}

/* .window {
  height: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: var(--layout-titlebar-height) minmax(0, 1fr);
  position: relative;
  overflow: hidden;
}

.window__main {
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
  overflow: hidden;

  &--with-sidebar {
    grid-template-columns: auto 1fr;
  }
} */
</style>
