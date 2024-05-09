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
        :src="avatar"
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
            {{ category }}
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

    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useElementVisibility, watchOnce } from '@vueuse/core';
import Avatar from './ui/Avatar.vue';

const slots = defineSlots<{
  default?: () => any;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
  visible: [];
}>();

defineProps<{
  name: string;
  avatar?: string;
  category?: string;
  details?: string;
  isLive?: boolean;
}>();

const rootElement = ref<HTMLDivElement>();

/**
 * @todo Improve by clearing observers after "visible" event is emitted
 * @todo Move to directive and convert component to .tsx
 */
const isRootElementVisible = useElementVisibility(rootElement);

watchOnce(isRootElementVisible, () => {
  emit('visible');
});
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.channel-card {
  &--with-slot {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
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
    color: var(--theme-color-text-secondary);
  }

  &__category,
  &__details {
    @extend %text-small;
  }

  &__category {
    @extend %text-small;
    color: var(--theme-color-text-tertiary);
    margin-left: 12px;
    display: flex;
    align-items: baseline;
  }

  &__details {
    @extend %text-overflow;
    color: var(--theme-color-text-tertiary);
  }
}
</style>
