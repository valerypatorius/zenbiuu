<template>
  <div
    :class="['library-item', isCompactLayout && 'library-item--compact']"
    @click="emit('click')"
  >
    <div
      ref="coverElement"
      class="library-item__cover"
    >
      <img
        :src="coverImageUrl"
        loading="lazy"
      />
    </div>

    <div class="library-item__info">
      <div
        class="library-item__title"
        :title="isCompactLayout ? stream.title : undefined"
      >
        {{ stream.title }}
      </div>

      <ChannelCard
        :name="name"
        :avatar="avatar"
        :details="stream.category"
        @visible="emit('channelVisible')"
      />

      <div class="library-item__counters">
        <div class="library-item__counter">
          <Icon
            name="users"
            :size="16"
          />

          <PrettyNumber :value="stream.viewersCount" />
        </div>

        <div class="library-item__counter">
          <Icon
            name="clock"
            :size="16"
          />

          <Duration :date-start="stream.dateStarted" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveStream } from '@client/shared';
import { ref, useTemplateRef, watch } from 'vue';
import ChannelCard from './ChannelCard.vue';
import Duration from './Duration.vue';
import Icon from './ui/Icon';
import PrettyNumber from './ui/PrettyNumber';
import { useSettings } from '~/services/useSettings';

const props = defineProps<{
  name: string;
  stream: LiveStream;
  avatar?: string;
}>();

const emit = defineEmits<{
  click: [];
  channelVisible: [];
}>();

const { isCompactLayout } = useSettings();

const coverElement = useTemplateRef('coverElement');

const coverImageUrl = ref(props.stream.cover);

/**
 * Avoid flickering by waiting for new cover image to load before changing source
 */
watch(
  () => props.stream.cover,
  (value) => {
    const image = new Image();

    image.onload = () => {
      coverImageUrl.value = value;
    };

    image.src = value;
  },
);
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

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

  &__duration {
    position: absolute;
    bottom: 8px;
    left: 8px;
  }

  &__info {
    padding: 14px 0 12px;
    display: grid;
    align-items: center;
    /* align-content: end; */
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  &__title {
    /* @extend %text-overflow; */
    grid-column: span 2;
    font-weight: 500;
  }

  &__counters {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  &__counter {
    @extend %text-small;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--theme-color-text-secondary);
  }
}

.library-item--compact {
  .library-item {
    &__title {
      @extend %text-overflow;
    }

    &__counters {
      flex-direction: row;
      gap: 16px;
    }
  }
}
</style>
