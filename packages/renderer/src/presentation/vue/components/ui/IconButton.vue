<template>
  <button
    :class="[
      'icon-button',
      active && 'icon-button--active',
    ]"
    :disabled="disabled"
    @click="(event) => emit('click', event)"
  >
    <Icon
      :name="icon"
      :size="size"
    />
  </button>
</template>

<script lang="ts" setup>
import Icon from './Icon';
import type icons from '@/assets/icons';

defineProps<{
  icon: keyof typeof icons;
  size?: number;
  disabled?: boolean;
  active?: boolean;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style lang="postcss">
.icon-button {
  background-color: transparent;
  color: var(--theme-color-text-secondary);
  padding: 4px;
  border-radius: 50%;
  /* transition: all 0.1s; */

  &--active {
    color: #cdb432;
    background-color: rgba(205, 180, 50, 0.1);
  }

  &[disabled] {
    pointer-events: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &:active {
    transform: translateY(1px);
  }
}
</style>
