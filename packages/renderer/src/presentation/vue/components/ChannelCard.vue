<template>
  <div
    ref="rootElement"
    :class="[
      'channel-card',
      details !== undefined && 'channel-card--with-details',
      slots.default !== undefined && 'channel-card--with-slot',
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

          <span
            v-if="category"
            class="channel-card__category"
          >
            <Icon
              name="playFilled"
              :size="8"
            /> {{ category }}
          </span>
        </div>

        <div
          v-if="details"
          class="channel-card__details"
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
import Icon from './ui/Icon.vue';
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
  category?: string;
  details?: string;
  isLive?: boolean;
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
  }

  &__info {
    min-width: 0;
  }

  &__name {
    @extend %text-overflow;
  }

  &__category {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
    margin-left: 4px;
    display: flex;
    align-items: baseline;

    .icon {
      color: var(--theme-color-text-tertiary);
      margin-right: 4px;
    }
  }

  &__details {
    @extend %text-overflow;
    color: var(--theme-color-text-secondary);
  }
}
</style>
