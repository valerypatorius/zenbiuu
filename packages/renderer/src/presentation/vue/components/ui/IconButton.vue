<template>
  <button
    class="icon-button"
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
import Icon from './Icon.vue';
import type icons from '@/assets/icons';

defineProps<{
  icon: keyof typeof icons;
  size?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style lang="postcss">
.icon-button {
  background-color: transparent;
  color: inherit;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.1s;

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
