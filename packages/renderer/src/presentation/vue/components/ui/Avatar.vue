<template>
  <div
    :class="[
      'avatar',
      isLoaded && 'avatar--loaded',
    ]"
  >
    <Icon
      name="user"
      :size="20"
    />

    <img
      v-if="src"
      :src="src"
      loading="lazy"
      @load.once="onLoad"
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Icon from './Icon.vue';

withDefaults(defineProps<{
  src?: string;
  size?: number;
}>(), {
  src: undefined,
  size: 36,
});

const isLoaded = ref(false);

function onLoad (): void {
  isLoaded.value = true;
}
</script>

<style lang="postcss">
.avatar {
  --size: v-bind('size + "px"');
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 5px 15px -5px var(--theme-color-text-secondary);
  overflow: hidden;
  color: var(--theme-color-text-tertiary);
  display: grid;
  place-items: center;

  img,
  .icon {
    grid-column: 1;
    grid-row: 1;
  }

  img {
    display: block;
    width: 100%;
    opacity: 0;
    transform: scale(1.15);
    transition: all 0.1s ease-out;
  }

  &--loaded {
    img {
      opacity: 1;
      transform: scale(1);
    }
  }
}
</style>
