<template>
  <div
    class="library-item"
    @click="emit('click')"
  >
    <div class="library-item__cover">
      <img
        :src="cover"
        loading="lazy"
      >
    </div>

    <div class="library-item__title">
      {{ title }}
    </div>

    <!-- <div class="library-item__details">
      {{ dateStarted }}<br>
      {{ viewersCount }}
    </div> -->

    <div class="library-item__details">
      <Avatar :src="channel.avatar" />

      {{ channel.name }}<br>
      {{ category }}
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from './ui/Avatar.vue';
import type LiveStream from '@/entities/LiveStream';

defineProps<LiveStream>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.library-item {
  display: grid;
  align-content: start;
  gap: 12px;

  &__cover {
    aspect-ratio: 16 / 9;
    background-color: black;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 20px -10px var(--theme-color-shadow);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__title {
    font-weight: 500;
  }

  &__details {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
    display: grid;
    gap: 12px;
    grid-template-columns: auto 1fr;
    align-items: center;
  }
}
</style>
