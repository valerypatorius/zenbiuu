<template>
  <div class="account">
    <div class="account__avatar">
      <img
        v-if="avatar"
        :src="avatar"
        loading="lazy"
      >
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { type Provider } from '@/providers/types';

defineProps<{
  id?: string;
  name?: string;
  avatar?: string;
  provider: Provider;
}>();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.account {
  display: grid;
  grid-template-columns: 36px 1fr;
  align-items: center;
  gap: 12px;

  &__avatar {
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 5px 15px -5px var(--theme-color-text-secondary);

    img {
      display: block;
      width: 100%;
    }
  }

  &__name {
    font-weight: 500;
  }

  &__details {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
  }
}
</style>
