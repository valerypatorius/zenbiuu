<template>
  <div
    class="library-item"
    @click="emit('click')"
  >
    <div
      ref="coverElement"
      class="library-item__cover"
    >
      <img
        :src="cover"
        loading="lazy"
      >
    </div>

    <div class="library-item__info">
      <div class="library-item__title">
        {{ title }}
      </div>

      <ChannelCard
        :name="channelName"
        :data="channel"
        :category="category"
        @visible="emit('channelVisible')"
      />

      <div class="library-item__counter">
        <Icon
          name="users"
          :size="16"
        />
        <PrettyNumber :value="viewersCount" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChannelCard from './ChannelCard.vue';
import Icon from './ui/Icon';
import PrettyNumber from './ui/PrettyNumber';
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

const coverElement = ref<HTMLElement | null>(null);
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.library-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  z-index: 1;

  &__cover {
    aspect-ratio: 16 / 9;
    border-radius: inherit;
    overflow: hidden;
    filter: contrast(90%);
    background-color: #000;
    box-shadow: 0 10px 20px -15px var(--theme-color-shadow);
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    padding: 12px 0;
    display: grid;
    align-content: end;
    grid-template-columns: 1fr auto;
    gap: 6px;
  }

  &__title {
    @extend %text-overflow;
    grid-column: span 2;
    font-weight: 500;
  }

  &__counter {
    @extend %text-small;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--theme-color-text-secondary);
  }
}
</style>
