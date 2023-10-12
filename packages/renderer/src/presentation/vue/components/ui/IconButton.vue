<template>
  <button
    class="icon-button"
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
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style lang="postcss">
.icon-button {
  background-color: transparent;
  color: inherit;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.1s;

  &:hover {
    background-color: var(--theme-color-text-tertiary);
  }

  &:active {
    transform: translateY(1px);
  }
}
</style>
