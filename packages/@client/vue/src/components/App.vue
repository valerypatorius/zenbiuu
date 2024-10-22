<template>
  <TitleBar />

  <main>
    <Library v-if="primaryAccount !== null" />
    <Auth v-else />
  </main>

  <SettingsOverlay v-if="isSettingsOpened" />
</template>

<script setup lang="ts">
import { useAccount } from '~/services/useAccount';
import { useSettings } from '~/services/useSettings';
import Auth from './Auth.vue';
import Library from './Library.vue';
import SettingsOverlay from './SettingsOverlay.vue';
import TitleBar from './Titlebar.vue';
import 'overlayscrollbars/overlayscrollbars.css';

const { primaryAccount } = useAccount();
const { state: isSettingsOpened } = useSettings();
</script>

<style lang="postcss">
@import '~/styles/reset.pcss';
@import '~/styles/themes.pcss';
@import '~/styles/typography.pcss';
@import '~/styles/layout.pcss';

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
