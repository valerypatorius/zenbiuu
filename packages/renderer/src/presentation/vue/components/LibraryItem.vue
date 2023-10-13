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

      <div class="library-item__counter">
        <Icon
          name="users"
          :size="16"
        />
        {{ viewersCount }}
      </div>
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
import Icon from './ui/Icon.vue';
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
    box-shadow: 0 10px 20px -10px var(--theme-color-shadow);
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }
  }

  &__title {
    font-weight: 500;
  }

  &__counter {
    @extend %text-small;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--theme-color-text-secondary);
    position: absolute;
    top: -12px;
    right: -12px;
    padding: 4px 12px;
    border-radius: 20px;
    backdrop-filter: blur(20px);
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: 0 5px 10px -5px var(--theme-color-shadow);
  }
}
</style>
