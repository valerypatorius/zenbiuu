<template>
  <div
    ref="rootElement"
    :class="[
      'channel-card',
      (isCompactLayout && !isIgnoreCompact) && 'channel-card--compact',
    ]"
  >
    <Avatar
      class="channel-card__avatar"
      :src="avatar"
      :size="(isCompactLayout && !isIgnoreCompact) ? 24 : 32"
      :is-online="isLive"
    />

    <div class="channel-card__info">
      <div class="channel-card__name">
        {{ name }}
      </div>

      <div
        v-if="details"
        class="channel-card__details"
        :title="details"
      >
        {{ details }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementVisibility, watchOnce } from '@vueuse/core';
import { useTemplateRef } from 'vue';
import Avatar from './ui/Avatar.vue';
import { useSettings } from '~/services/useSettings';
import { useLibrary } from '~/services/useLibrary';

const props = defineProps<{
  name: string;
  avatar?: string;
  details?: string;
  isLive?: boolean;
  isIgnoreCompact?: boolean;
}>();

const { isCompactLayout } = useSettings();
const { requestChannelByName } = useLibrary();
const rootElement = useTemplateRef('rootElement');
const isRootElementVisible = useElementVisibility(rootElement);

watchOnce(isRootElementVisible, () => {
  requestChannelByName(props.name);
});
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.channel-card {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;

  &__info {
    @extend %text-overflow;
  }

  &__name {
    color: var(--theme-color-text-secondary);
  }

  &__details {
    @extend %text-small;
    color: var(--theme-color-text-tertiary);
  }
}

.channel-card--compact {
  .channel-card__info {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
}
</style>
