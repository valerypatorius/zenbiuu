<template>
  <button class="button">
    <slot />
  </button>
</template>

<script lang="ts" setup>
</script>

<style lang="postcss">
.button {
  background-color: var(--theme-color-button-background);
  color: var(--theme-color-button-text);
  box-shadow: 0 10px 20px -10px var(--theme-color-button-background);
  height: 42px;
  line-height: 42px;
  padding: 0 22px;
  border-radius: 40px;
  font-weight: 500;
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  vertical-align: middle;
  transition: all 0.1s;

  &:hover {
    background-color: var(--theme-color-button-background-hover);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 5px 10px -5px var(--theme-color-button-background);
  }
}
</style>
