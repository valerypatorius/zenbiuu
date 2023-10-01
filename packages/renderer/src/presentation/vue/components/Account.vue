<template>
  <div class="account">
    <Avatar :src="avatar" />

    <div class="account__main">
      <div
        v-if="name"
        class="account__name"
      >
        {{ name }}
      </div>

      <div class="account__details">
        {{ provider }}
      </div>
    </div>

    <div class="account__actions">
      <div
        :class="[
          'account__action',
          isPrimary && 'account__action--active',
        ]"
        @click="emit('select')"
      >
        <Icon
          class="account__primary"
          name="crown"
          :size="20"
        />
      </div>

      <div
        class="account__action"
        @click="emit('remove')"
      >
        <Icon
          name="trash"
          :size="20"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from './ui/Avatar.vue';
import Icon from './ui/Icon.vue';
import type Provider from '@/entities/Provider';

defineProps<{
  id?: string;
  name?: string;
  avatar?: string;
  provider: Provider;
  isPrimary: boolean;
}>();

const emit = defineEmits<{
  select: [];
  remove: [];
}>();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.account {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  min-width: 0;

  &__main {
    min-width: 0;
  }

  &__name {
    font-weight: 500;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__details {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
  }

  &__actions {
    align-self: stretch;
    display: flex;
    color: var(--theme-color-text-secondary);
  }

  &__action {
    display: flex;
    align-items: center;
    padding: 0 10px;
    cursor: pointer;

    &--active {
      color: var(--theme-color-button-background);
      pointer-events: none;
    }

    &:hover {
      background-color: var(--theme-color-button-background);
      color: var(--theme-color-button-text);
    }
  }
}
</style>
