<template>
  <div class="sidebar-search">
    <input
      :value="query"
      type="text"
      tabindex="-1"
      :placeholder="$t('sidebar.search')"
      @input="onInput"
    >

    <icon name="Search" />

    <div
      v-if="query"
      ref="searchInput"
      class="sidebar-search__remove"
      @click="emit('clear')"
    >
      <icon name="Close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/src/components/ui/Icon.vue';

defineProps<{
  /** Search query model */
  query: string;
}>();

const emit = defineEmits<{
  (e: 'update:query', value: string): void;
  (e: 'clear'): void;
}>();

/**
 * Emit event to update query model value
 */
function onInput (event: Event): void {
  const { value } = event.target as HTMLInputElement;

  emit('update:query', value);
}
</script>

<style lang="postcss">
  .sidebar-search {
    display: flex;
    align-items: center;
    position: relative;
    height: var(--item-height, 4rem);

    input {
      width: 100%;
      height: 100%;
      padding-left: calc(var(--offset-x) + var(--size-icon) + var(--offset-icon));
      padding-right: calc(var(--offset-x) + var(--size-icon) + var(--offset-icon));
      background-color: transparent;
      color: var(--color-text);
      font-weight: 500;
      position: absolute;
      left: 0;
      background-color: var(--color-overlay-full);
      border-radius: var(--border-radius);

      &::placeholder {
        color: var(--color-text-secondary);
      }

      &:focus::placeholder {
        color: var(--color-transparent);
      }

      /** Search icon */
      &:focus + .icon {
        color: var(--color-text);
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

    /** Remove button */
    &__remove {
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
