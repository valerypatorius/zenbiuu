<template>
  <button
    :class="[
      'button',
      type && `button--${type}`,
    ]"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  type?: 'secondary';
}>();
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

  &--secondary {
    background-color: #252525;
    /* color: var(--theme-color-text-secondary); */
    box-shadow: 0 10px 20px -10px #111;

    &:hover {
      background-color: #212121;
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 5px 10px -5px #111;
    }
  }
}
</style>
