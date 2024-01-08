<template>
  <div
    :class="[
      'avatar',
      isLoaded && 'avatar--loaded',
      isOnline && 'avatar--online',
    ]"
  >
    <Icon
      name="user"
      :size="size * 0.5"
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
import Icon from './Icon';

withDefaults(defineProps<{
  src?: string;
  size?: number;
  isOnline?: boolean;
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
  box-shadow: 0 5px 15px -5px var(--theme-color-shadow);
  color: var(--theme-color-text-secondary);
  display: grid;
  place-items: center;
  background-color: var(--theme-color-text-tertiary);

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
    border-radius: inherit;
  }

  &--loaded {
    img {
      opacity: 1;
      transform: scale(1);
    }
  }

  &--online {
    &::after {
      --size: 6px;
      content: '';
      width: var(--size);
      height: var(--size);
      background-color: #00e640;
      box-shadow: 0 0 0 2px var(--theme-color-background);
      border-radius: 50%;
      grid-column: 1;
      grid-row: 1;
      transform: translateX(0);
      align-self: end;
      justify-self: end;
    }
  }
}
</style>
