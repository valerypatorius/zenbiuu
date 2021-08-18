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
      @click="$emit('clear')"
    >
      <icon name="Close" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';

export default defineComponent({
  name: 'SidebarSearch',
  components: {
    Icon,
  },
  props: {
    /**
     * Search query model
     */
    query: {
      type: String,
      default: '',
    },
  },
  emits: ['update:query', 'clear'],
  methods: {
    /**
     * Emit event to update query model value
     */
    onInput (event: Event): void {
      const { value } = event.target as HTMLInputElement;

      this.$emit('update:query', value);
    },
  },
});
</script>

<style>
  .sidebar-search {
    display: flex;
    align-items: center;
    position: relative;
    height: var(--item-height, 4rem);
  }

  .sidebar-search input {
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
  }

  .sidebar-search input::placeholder {
    color: var(--color-text-secondary);
  }

  .sidebar-search input:focus::placeholder {
    color: var(--color-transparent);
  }

  /** Search icon */
  .sidebar-search input:focus + .icon {
    color: var(--color-text);
  }

  .sidebar-search .icon--Search {
    width: var(--size-icon);
    position: absolute;
    left: var(--offset-x);
    margin-top: 0.2rem;
    color: var(--color-text-secondary);
    pointer-events: none;
  }

  /** Remove button */
  .sidebar-search__remove {
    height: 100%;
    display: flex;
    align-items: center;
    position: absolute;
    right: 0;
    padding: 0 var(--offset-x);
    color: var(--color-text-secondary);
    cursor: pointer;
  }

  .sidebar-search__remove .icon {
    width: var(--size-icon);
  }

  .sidebar-search__remove:hover {
    color: var(--color-text);
  }
</style>
