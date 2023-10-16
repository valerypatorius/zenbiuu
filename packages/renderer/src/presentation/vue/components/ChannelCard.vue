<template>
  <div
    ref="rootElement"
    :class="[
      'channel-card',
      details !== undefined && 'channel-card--with-details',
      slots.default !== undefined && 'channel-card--with-slot',
      isInteractable === true && 'channel-card--interactable',
      isLive === true && 'channel-card--live',
    ]"
  >
    <div
      class="channel-card__main"
      @click="(event) => emit('click', event)"
    >
      <Avatar
        class="channel-card__avatar"
        :src="data?.avatar"
        :size="details !== undefined ? 36 : 24"
        :is-online="isLive"
      />

      <div class="channel-card__info">
        <div class="channel-card__name">
          {{ name }}
        </div>

        <div
          v-if="details"
          class="channel-card__category"
        >
          {{ details }}
        </div>
      </div>
    </div>

    <slot name="default" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useElementVisibility, watchOnce } from '@vueuse/core';
import Avatar from './ui/Avatar.vue';
import type ChannelEntity from '@/entities/ChannelEntity';

const slots = defineSlots<{
  default?: () => any;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
  visible: [];
}>();

defineProps<{
  name: string;
  data?: ChannelEntity;
  details?: string;
  isLive?: boolean;
  isInteractable?: boolean;
}>();

const rootElement = ref<HTMLDivElement>();

/**
 * @todo Improve by clearing observers after "visible" event is emitted
 */
const isRootElementVisible = useElementVisibility(rootElement);

watchOnce(isRootElementVisible, () => {
  emit('visible');
});
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.channel-card {
  &--with-slot {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  &--with-details {
    @extend %text-small;
  }

  &__main {
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr;
    gap: 0 12px;
    color: var(--theme-color-text-secondary);

    .channel-card--interactable & {
      cursor: pointer;
    }

    .channel-card--interactable &:hover  {
      color: var(--theme-color-text);
    }
  }

  &__info {
    min-width: 0;
  }

  &__name {
    @extend %text-overflow;
  }

  &__category {
    @extend %text-overflow;
    color: var(--theme-color-text-secondary);
  }
}
</style>
