<template>
  <div
    ref="rootElement"
    :class="[
      'channel',
      details !== undefined && 'channel--with-details',
      slots.default !== undefined && 'channel--with-slot',
      isInteractable === true && 'channel--interactable',
      isLive === true && 'channel--live',
    ]"
  >
    <div
      class="channel__main"
      @click="(event) => emit('click', event)"
    >
      <Avatar
        class="channel__avatar"
        :src="data?.avatar"
        :size="details !== undefined ? 36 : 28"
        :is-online="isLive"
      />

      <div class="channel__info">
        <div class="channel__name">
          {{ name }}
        </div>

        <div
          v-if="details"
          class="channel__category"
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

.channel {
  &--with-slot {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  &--with-details {
    @extend %text-small;
  }

  &--interactable {
    cursor: pointer;
  }

  &__main {
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr;
    gap: 0 12px;
    color: var(--theme-color-text-secondary);

    .channel--live & {
      color: var(--theme-color-text);
    }

    .channel--interactable &:hover  {
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
