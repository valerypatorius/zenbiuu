<template>
  <div
    ref="rootElement"
    :class="[
      'channel',
      details !== undefined && 'channel--with-details',
      slots.default !== undefined && 'channel--with-slot',
      isInteractable === true && 'channel--interactable',
    ]"
  >
    <div
      class="channel__main"
      @click="(event) => emit('click', event)"
    >
      <Avatar
        class="channel__avatar"
        :src="channel?.avatar"
        :size="details !== undefined ? 36 : 28"
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

    <div v-if="slots.default !== undefined">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementVisibility, watchOnce } from '@vueuse/core';
import { useLibrary } from '../services/useLibrary';
import Avatar from './ui/Avatar.vue';
import type ChannelEntity from '@/entities/ChannelEntity';

const slots = defineSlots<{
  default?: () => any;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const props = defineProps<{
  name: string;
  details?: string;
  isInteractable?: boolean;
}>();

const rootElement = ref<HTMLDivElement>();

const { channelsByName, requestChannelByName } = useLibrary();
const isRootElementVisible = useElementVisibility(rootElement);

const channel = computed<ChannelEntity | undefined>(() => channelsByName.value[props.name]);

watchOnce(isRootElementVisible, () => {
  requestChannelByName(props.name);
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
