<template>
  <div class="search">
    <input
      :value="query"
      type="text"
      tabindex="-1"
      :placeholder="t('search')"
      @input="onInput"
    >

    <icon name="Search" />

    <div
      v-if="query"
      class="search__clear"
      @click="onClear"
    >
      <icon name="Close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Icon from '@/src/modules/ui/components/Icon.vue';

defineProps<{
  /** Search query model */
  query: string;
}>();

const emit = defineEmits<{
  (e: 'update:query', value: string): void;
  (e: 'clear'): void;
}>();

const { t } = useI18n();

/**
 * Emit event to update query model value
 */
function onInput (event: Event): void {
  const { value } = event.target as HTMLInputElement;

  emit('update:query', value);
}

/**
 * Clear model value and emit "clear" event
 */
function onClear () {
  emit('update:query', '');
  emit('clear');
}
</script>

<style lang="postcss">
  .search {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    height: var(--item-height);

    input {
      width: 100%;
      height: 100%;
      padding-left: calc(var(--offset-x) + var(--size-icon) + var(--offset-icon));
      padding-right: calc(var(--offset-x) + var(--size-icon) + var(--offset-icon));
      background-color: transparent;
      color: var(--color-text);
      font-weight: var(--font-weight, 500);
      position: absolute;
      left: 0;
      background-color: var(--color-overlay);
      border-radius: var(--border-radius);

      &::placeholder {
        color: var(--color-text-secondary);
      }

      &:focus {
        background-color: var(--color-overlay-full);

        &::placeholder {
          color: var(--color-transparent);
        }

        + .icon {
          color: var(--color-text);
        }
      }
    }

    .icon--Search {
      width: var(--size-icon);
      position: absolute;
      left: var(--offset-x);
      margin-top: 0.2rem;
      color: var(--color-text-secondary);
      pointer-events: none;
    }

    &__clear {
      height: 100%;
      display: flex;
      align-items: center;
      position: absolute;
      right: 0;
      padding: 0 var(--offset-x);
      color: var(--color-text-secondary);
      cursor: pointer;

      .icon {
        width: var(--size-icon);
      }

      &:hover {
        color: var(--color-text);
      }
    }
  }
</style>
