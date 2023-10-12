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

    <Channel
      :name="channelName"
      :details="category"
      :data="channel"
      @visible="emit('channelVisible')"
    />
  </div>
</template>

<script setup lang="ts">
import Channel from './Channel.vue';
import type LiveStream from '@/entities/LiveStream';
import type ChannelEntity from '@/entities/ChannelEntity';

type Props = LiveStream & {
  channel?: ChannelEntity;
};

defineProps<Props>();

const emit = defineEmits<{
  click: [];
  channelVisible: [];
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
}
</style>
