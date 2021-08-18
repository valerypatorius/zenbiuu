<template>
  <div
    :class="[
      'control',
      'control--size-' + size,
      {
        'control--disabled': isDisabled,
        'control--active': isActive,
      },
    ]"
    :title="title"
    @click="$emit('click')"
  >
    <icon
      v-if="icon"
      :name="icon"
    />

    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';

/**
 * Available control sizes
 */
export enum Size {
  Default = 'default',
  Large = 'large',
}

export default defineComponent({
  name: 'Control',
  components: {
    Icon,
  },
  props: {
    /**
     * Control size
     */
    size: {
      type: String as PropType<Size>,
      default: Size.Default,
    },

    /**
     * Icon name
     */
    icon: {
      type: String,
      default: '',
    },

    /**
     * Title text for tooltip on hover
     */
    title: {
      type: String,
      default: '',
    },

    /**
     * If true, control is displayed as disabled, but remains clickable
     */
    isDisabled: {
      type: Boolean,
      default: false,
    },

    /**
     * If true, control is displayed as active
     */
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
});
</script>

<style>
  .control {
    --size: 4rem;
    --size-icon: 2rem;

    width: var(--size);
    height: var(--size);
    border-radius: var(--border-radius);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .control--size-large {
    --size: 5rem;
    --size-icon: 3rem;
  }

  .control--active,
  .control:hover {
    background-color: var(--color-control-active);
  }

  .control .icon {
    width: var(--size-icon);
  }

  .control--disabled .icon {
    opacity: 0.5;
  }
</style>
