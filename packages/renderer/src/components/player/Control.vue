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
    @click="emit('click')"
  >
    <Icon
      v-if="icon"
      :name="icon"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import Icon from '@/src/components/ui/Icon.vue';

const {
  size = 'default',
} = defineProps<{
  /** Control size */
  size?: 'default' | 'large';

  /** Icon name */
  icon?: string;

  /** Title text for tooltip on hover */
  title?: string;

  /** If true, control is displayed as active */
  isActive?: boolean;

  /** If true, control is displayed as disabled, but remains clickable */
  isDisabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();
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
