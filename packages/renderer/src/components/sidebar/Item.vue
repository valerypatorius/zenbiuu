<template>
  <div
    :class="[
      'sidebar-item',
      {
        'sidebar-item--with-details': details.length,
        'sidebar-item--with-badge': isBadge,
        'sidebar-item--only-icon': !label.length && !details.length,
        'sidebar-item--active': isActive,
        'sidebar-item--loading': isLoading,
        'sidebar-item--disabled': isDisabled,
        'sidebar-item--secondary': isSecondary,
      },
    ]"
    @click="$emit('click')"
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

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';

export default defineComponent({
  name: 'SidebarItem',
  components: {
    Icon,
  },
  props: {
    /**
     * Main text label string
     */
    label: {
      type: String,
      default: '',
    },

    /**
     * Additional details string
     */
    details: {
      type: String,
      default: '',
    },

    /**
     * Icon name
     */
    icon: {
      type: String,
      default: '',
    },

    /**
     * Image url
     */
    image: {
      type: String,
      default: '',
    },

    /**
     * True, if item should appear as active
     */
    isActive: {
      type: Boolean,
      default: false,
    },

    /**
     * True, if item should appear as loading
     */
    isLoading: {
      type: Boolean,
      default: false,
    },

    /**
     * True, if item should appear as disabled
     */
    isDisabled: {
      type: Boolean,
      default: false,
    },

    /**
     * True, if item should have a badge to draw attention
     */
    isBadge: {
      type: Boolean,
      default: false,
    },

    /**
     * True, if item text color is secondary
     */
    isSecondary: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
});
</script>

<style>
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
  }

  .sidebar-item:hover {
    background-color: var(--color-control-semiactive);
  }

  .sidebar-item--with-details {
    height: auto;
    padding: 0.8rem var(--offset-x) 0.6rem;
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
  }

  .sidebar-item--active {
    background-color: var(--color-control-active);
    color: var(--color-text);
    pointer-events: none;
  }

  .sidebar-item--only-icon {
    align-self: flex-start;
  }

  .sidebar-item--loading {
    pointer-events: none;
    filter: grayscale(1);
    opacity: 0.2;
  }

  .sidebar-item--secondary {
    color: var(--color-text-secondary);
  }

  .sidebar-item--disabled  {
    color: var(--color-text-secondary);
    pointer-events: none;
  }

  .sidebar-item--disabled .sidebar-item__image {
    filter: grayscale(1);
    opacity: 0.6;
  }

  .sidebar-item--with-badge::after {
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
  .sidebar-item__icon {
    flex-shrink: 0;
  }

  .sidebar-item__icon:not(:last-child) {
    margin-right: var(--offset-icon);
  }

  .sidebar-item__icon .icon {
    width: var(--size-icon);
  }

  /** Image */
  .sidebar-item__image {
    width: var(--size-icon);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    margin-right: var(--offset-icon);
  }

  .sidebar-item__image::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  .sidebar-item__image img {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  /** Text label */
  .sidebar-item__label {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: -0.2rem;
    font-weight: 500;
  }

  /** Additional details */
  .sidebar-item__details {
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    grid-column: 2 / 2;
  }
</style>
