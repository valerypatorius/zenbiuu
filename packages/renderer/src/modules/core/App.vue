<template>
  <div class="window">
    <TitleBar />

    <div
      :class="[
        'window__main',
        isMountSidebar && 'window__main--with-sidebar',
      ]"
    >
      <Sidebar v-if="isMountSidebar" />

      <RouterView :key="route.path" />

      <Settings v-if="isSettingsActive" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { callWindowMethod, checkAppUpdates } from '@/src/infrastructure/hub/hub';
import TitleBar from '@/src/modules/core/components/Titlebar.vue';
import Sidebar from '@/src/modules/library/components/sidebar/Sidebar.vue';
import Settings from '@/src/modules/settings/Settings.vue';
import { useInterface } from '@/src/infrastructure/interface/useInterface';
import { useApp } from '@/src/store/useApp';
import { useUser } from '@/src/store/useUser';
import { useAuth } from '@/src/store/useAuth';
import { useHub } from '@/src/store/useHub';

useHub();
useAuth();

const route = useRoute();
const { isSettingsActive } = useInterface();
const { state: appState } = useApp();
const { state: userState } = useUser();

/**
 * True, if sidebar should be mounted.
 * There is a time gap between receiving token and name,
 * so sidebar should be mounted only when name is present
 */
const isMountSidebar = computed(() => userState.name !== undefined);

/** True, if app window is set always on top */
const isAlwaysOnTop = computed(() => appState.settings.isAlwaysOnTop);

/**
 * When "isAlwaysOnTop" setting is changed,
 * update window state
 */
watchEffect(() => {
  callWindowMethod('setAlwaysOnTop', isAlwaysOnTop.value);
});

/** Set initial interface size */
document.documentElement.style.setProperty('--size-base', appState.interfaceSize.toString());

/** Check for updates */
checkAppUpdates();
</script>

<style lang="postcss">
  :root {
    /** Base black color */
    --rgb-black: 0, 0, 0;

    /** Base white color */
    --rgb-white: 255, 255, 255;

    /** Base red color */
    --rgb-red: 217, 30, 24;

    /** Base green color */
    --rgb-green: 46, 204, 113;

    /** Base size for all rem values */
    --size-base: 10;

    /** Window content offset */
    --offset-window: 3.2rem;

    /** Navigation titlebar height */
    --height-titlebar: 4rem;

    /** Scrollbar width */
    --width-scrollbar: 1rem;

    /** Border radius for most elements */
    --border-radius: 0.85rem;

    /** Standart 16:9 ratio for videos */
    --ratio-video: 56.25%;

    /** Default timing function for animations */
    --easing: cubic-bezier(0.645, 0.045, 0.355, 1);

    /** App font family */
    --font-system-sans: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;

    /** Unniversal rgb values */
    --rgb-accent: 77, 19, 209;
    --rgb-link: 155, 126, 247;

    /** Universal colors */
    --color-button: rgba(var(--rgb-accent), 1);
    --color-button-text: rgba(var(--rgb-white), 1);
    --color-link: rgba(var(--rgb-link), 1);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --rgb-background: 23, 24, 27;
      --rgb-overlay: 10, 10, 10;
      --rgb-text: 216, 220, 221;

      --color-transparent: rgba(var(--rgb-text), 0);
      --color-background: rgba(var(--rgb-background), 1);
      --color-overlay-full: rgba(var(--rgb-overlay), 0.9);
      --color-overlay: rgba(var(--rgb-overlay), 0.5);
      --color-text: rgba(var(--rgb-text), 1);
      --color-text-secondary: rgba(var(--rgb-text), 0.5);
      --color-text-tertiary: rgba(var(--rgb-text), 0.3);
      --color-control-active: rgba(var(--rgb-text), 0.05);
      --color-control-semiactive: rgba(var(--rgb-text), 0.025);
    }
  }

  @media (prefers-color-scheme: light) {
    :root {
      --rgb-background: 242, 241, 239;
      --rgb-overlay: 222, 218, 218;
      --rgb-text: 46, 49, 49;

      --color-transparent: rgba(var(--rgb-text), 0);
      --color-background: rgba(var(--rgb-background), 1);
      --color-overlay-full: rgba(var(--rgb-overlay), 0.9);
      --color-overlay: rgba(var(--rgb-overlay), 0.6);
      --color-text: rgba(var(--rgb-text), 1);
      --color-text-secondary: rgba(var(--rgb-text), 0.7);
      --color-text-tertiary: rgba(var(--rgb-text), 0.5);
      --color-control-active: rgba(var(--rgb-text), 0.085);
      --color-control-semiactive: rgba(var(--rgb-text), 0.04);
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    outline: 0;
  }

  html,
  body {
    height: 100%;
  }

  html {
    font-size: calc(1px * var(--size-base));
    user-select: none;
  }

  body {
    margin: 0;
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: var(--font-system-sans);
    font-size: 1.4rem;
    line-height: 1.5em;
  }

  input, textarea {
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    font-family: inherit;
    font-size: inherit;
  }

  img {
    image-rendering: -webkit-optimize-contrast;
  }

  strong {
    font-weight: 500;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  p {
    margin-top: 0;
    margin-bottom: 0;
  }

  p:not(:last-child) {
    margin-bottom: 1.2em;
  }

  p img {
    display: block;
  }

  p a {
    color: var(--color-link);
  }

  p a:hover {
    color: var(--color-text);
  }

  h1, h2, h3 {
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 1.2em;
  }

  h2:not(:first-child),
  h3:not(:first-child) {
    margin-top: 2.4em;
  }

  li {
    list-style: none;
    position: relative;
    padding-left: 1.6rem;
    display: flex;
    align-items: center;
  }

  li::before {
    content: '';
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background-color: var(--color-text-tertiary);
    position: absolute;
    left: 0;
  }

  li:not(:last-child) {
    margin-bottom: 0.6em;
  }

  button,
  .button {
    border: 0;
    padding: 0 1.8rem;
    margin: 0;
    outline: 0;
    background-color: transparent;
    font-family: inherit;
    font-size: inherit;
    font-weight: 500;
    color: var(--color-button-text);
    background-color: var(--color-button);
    display: flex;
    align-items: center;
    height: 3.6rem;
    cursor: pointer;
    border-radius: var(--border-radius);
    white-space: nowrap;
  }

  button:hover,
  .button:hover {
    color: var(--color-background);
    background-color: var(--color-text);
  }

  button:active,
  .button:active {
    transform: translateY(1px);
  }

  button:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  button .icon {
    width: 2rem;
    margin-right: 1rem;
    margin-left: -0.25rem;
  }

  .window {
    height: 100%;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: var(--height-titlebar) minmax(0, 1fr);
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
  }

  /** Custom scrollbar styles */
  .scrollable {
    --scrollbar-size: var(--width-scrollbar);
    --scrollbar-offset: 0.4rem;

    overflow-x: hidden;
    overflow-y: scroll;
    position: relative;

    &::-webkit-scrollbar {
      width: var(--scrollbar-size);
      height: var(--scrollbar-size);
      opacity: 0;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--color-transparent);
      background-clip: padding-box;
      border: var(--scrollbar-offset) solid transparent;
      border-radius: var(--scrollbar-size);
    }

    &:hover::-webkit-scrollbar-thumb {
      background-color: var(--color-control-active);
    }

    &::-webkit-scrollbar-thumb:hover {
      --scrollbar-offset: 0.2rem;
    }
  }
</style>
