<template>
  <div
    :class="[
      'sidebar-item',
      {
        'sidebar-item--with-details': details?.length,
        'sidebar-item--with-badge': isBadge,
        'sidebar-item--only-icon': isOnlyIcon,
        'sidebar-item--active': isActive,
        'sidebar-item--loading': isLoading,
        'sidebar-item--disabled': isDisabled,
        'sidebar-item--secondary': isSecondary,
      },
    ]"
    @click="emit('click')"
  >
    <!-- Icon -->
    <div
      v-if="icon"
      class="sidebar-item__icon"
    >
      <icon :name="icon" />
    </div>

    <!-- Image -->
    <div
      v-if="image"
      class="sidebar-item__image"
    >
      <img
        :src="image"
        loading="lazy"
        alt=""
      >
    </div>

    <!-- Label -->
    <div
      v-if="label"
      class="sidebar-item__label"
    >
      {{ label }}
    </div>

    <!-- Additional details -->
    <div
      v-if="details"
      class="sidebar-item__details"
    >
      {{ details }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IconName } from '@/src/modules/ui/components/types';
import Icon from '@/src/modules/ui/components/Icon.vue';

const props = defineProps<{
  /** Main text label string */
  label?: string;

  /** Additional details string */
  details?: string;

  /** Icon name */
  icon?: IconName;

  /** Image url */
  image?: string;

  /** True, if item should appear as active */
  isActive?: boolean;

  /** True, if item should appear as loading */
  isLoading?: boolean;

  /** True, if item should appear as disabled */
  isDisabled?: boolean;

  /** True, if item should have a badge to draw attention */
  isBadge?: boolean;

  /** True, if item text color is secondary */
  isSecondary?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const isOnlyIcon = computed(() => !props.label?.length && !props.details?.length);
</script>

<style lang="postcss">
  .sidebar-item {
    flex-shrink: 0;
    height: var(--item-height, 4rem);
    display: flex;
    align-items: center;
    color: var(--color-text);
    padding: 0 var(--offset-x);
    cursor: pointer;
    white-space: nowrap;
    border-radius: var(--border-radius);
    position: relative;
    z-index: 1;
    overflow: hidden;

    &:hover {
      background-color: var(--color-control-semiactive);
    }

    &--with-details {
      height: auto;
      padding: 0.8rem var(--offset-x) 0.6rem;
      display: grid;
      align-items: center;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
    }

    &--active {
      background-color: var(--color-control-active);
      color: var(--color-text);
      pointer-events: none;
    }

    &--only-icon {
      align-self: flex-start;
    }

    &--loading {
      pointer-events: none;
      filter: grayscale(1);
      opacity: 0.2;
    }

    &--secondary {
      color: var(--color-text-secondary);
    }

    &--disabled  {
      color: var(--color-text-secondary);

      .sidebar-item__image {
        filter: grayscale(1);
        opacity: 0.6;
      }
    }

    &--with-badge::after {
      content: '';
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 50%;
      position: absolute;
      top: 0.4rem;
      right: 0.4rem;
      background-color: var(--color-button);
    }

    /** Icon */
    &__icon {
      flex-shrink: 0;

      &:not(:last-child) {
        margin-right: var(--offset-icon);
      }

      .icon {
        width: var(--size-icon);
      }
    }

    /** Image */
    &__image {
      width: var(--size-icon);
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      border-radius: 50%;
      margin-right: var(--offset-icon);

      &::before {
        content: '';
        display: block;
        padding-top: 100%;
      }

      img {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
    }

    /** Text label */
    &__label {
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: -0.2rem;
      font-weight: 500;
    }

    /** Additional details */
    &__details {
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      grid-column: 2 / 2;
    }
  }
</style>
