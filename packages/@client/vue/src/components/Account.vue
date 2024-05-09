<template>
  <div class="account">
    <div class="account__avatar">
      <Avatar :src="avatar" />

      <div
        class="account__provider"
        :style="{
          'background-color': availableProviders[provider].color,
        }"
      >
        <Icon
          class="account__primary"
          :raw="availableProviders[provider].icon"
          :size="18"
        />
      </div>
    </div>

    <div class="account__main">
      <div class="account__name">
        {{ name }}
      </div>

      <div class="account__details">Активен до {{ expirationDate }}</div>
    </div>

    <div class="account__actions">
      <div
        :class="['account__action', isPrimary && 'account__action--active']"
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
import { computed } from 'vue';
import { useProviders } from '~/services/useProviders';
import Avatar from './ui/Avatar.vue';
import Icon from './ui/Icon';
import type { AccountEntity } from '@client/shared';

type Props = AccountEntity & {
  isPrimary?: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [];
  remove: [];
}>();

const { available: availableProviders } = useProviders();

const expirationDate = computed(() =>
  props.tokenExpirationDate !== undefined ? new Date(props.tokenExpirationDate).toLocaleString() : '',
);
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.account {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  min-width: 0;

  &__main {
    min-width: 0;
  }

  &__avatar {
    position: relative;
  }

  &__provider {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    position: absolute;
    bottom: -6px;
    right: -6px;
    z-index: 1;

    svg {
      width: 100%;
      height: auto;
    }
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
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
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
