<template>
  <div
    :class="[
      'popup-overlay',
      {
        'popup-overlay--with-blur': isBlurEnabled,
      },
    ]"
    @click.self="emit('close')"
  >
    <div class="popup">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import type { RootSchema, ModulesSchema } from '@/types/schema';

const store = useStore<RootSchema & ModulesSchema>();

const emit = defineEmits<{
  (name: 'close'): void;
}>();

/** Returns true, if interface blur is enabled in settings */
const isBlurEnabled = computed(() => store.state.app.settings.isBlurEnabled);
</script>

<style lang="postcss">
  .popup-overlay {
    padding: var(--offset-window);
    display: grid;
    grid-template-columns: minmax(0, 70rem);
    grid-template-rows: minmax(0, max-content);
    align-content: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
    background-color: var(--color-overlay-full);
    overflow: hidden;

    &--with-blur {
      backdrop-filter: blur(15px);
    }
  }

  .popup {
    background-color: var(--color-background);
    border-radius: var(--border-radius);
    height: 55rem;
    max-height: 100%;
  }
</style>
