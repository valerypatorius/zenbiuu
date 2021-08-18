<template>
  <div class="loader" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Loader',
});
</script>

<style>
  .loader {
    --size-main: 1.6rem;
    --size-border: 0.2rem;

    width: var(--size-main);
    height: var(--size-main);
    border-width: var(--size-border);
    border-style: solid;
    border-color: transparent;
    border-top-color: var(--color-text-tertiary);
    border-radius: 50%;
    animation: spin 0.3s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
