<template>
  <div class="filters">
    <div class="filters__label">
      <icon name="Filters" />
      {{ t('sorting.label') }}
    </div>

    <div
      v-for="(types, name) in controls"
      :key="name"
      :class="[
        'filter',
        {
          'filter--active': name === currentSorting.name,
        },
      ]"
      @click="setSorting(name, types)"
    >
      {{ t(`sorting.${name}`) }}

      <icon
        v-if="types.length > 1 && name === currentSorting.name"
        :name="currentSorting.type === SortingType.Asc ? 'ArrowUp' : 'ArrowDown'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '@/src/modules/ui/components/Icon.vue';
import { Sorting, SortingType } from '@/types/renderer/library';
import { useLibrary } from '@/src/store/useLibrary';

const emit = defineEmits<{
  (e: 'change', sorting: Sorting): void;
}>();

const { t } = useI18n();
const { state: libraryState } = useLibrary();

/** Current sorting params */
const currentSorting = computed(() => {
  const [name, type] = libraryState.sorting.split('-');

  return {
    name,
    type,
  };
});

/** Sorting controls */
const controls = computed(() => {
  return Object.values(Sorting)
    .reduce((result: Record<string, SortingType[]>, value: Sorting) => {
      const [name, type] = value.split('-') as SortingType[];

      if (Array.isArray(result[name])) {
        result[name].push(type);
      } else {
        result[name] = [
          type,
        ];
      }

      return result;
    }, {});
});

/**
 * Try to set sorting with specified params
 */
function setSorting (name: string, types: SortingType[]): void {
  /**
   * If name matches, but type is single, do not proceed
   */
  if (name === currentSorting.value.name && types.length < 2) {
    return;
  }

  /**
   * If name matches, toggle type
   */
  if (name === currentSorting.value.name) {
    const newType = types.filter((type) => type !== currentSorting.value.type)[0];

    if (!newType) {
      return;
    }

    emit('change', [name, newType].join('-') as Sorting);

    return;
  }

  /**
   * Set new name with first type in list
   */
  emit('change', [name, types[0]].join('-') as Sorting);
}
</script>

<style>
  .filters {
    --height: 4rem;
    --gap: 0.8rem;
    --icon-opacity: 0.7;

    height: var(--height);
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    box-sizing: content-box;
  }

  .filters__label {
    display: flex;
    align-items: center;
    padding-right: 0.8rem;
    margin-right: var(--gap);
  }

  .filters__label .icon {
    width: 2rem;
    margin-right: var(--gap);
  }

  .filter {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.2rem 0.8rem;
    border-radius: var(--border-radius);
  }

  .filter--active {
    background-color: var(--color-control-active);
    color: var(--color-text);
  }

  .filter:not(.filter--active):hover {
    background-color: var(--color-control-semiactive);
  }

  .filter:not(:last-child) {
    margin-right: var(--gap);
  }

  .filter .icon {
    margin-left: 0.4rem;
    margin-right: -0.4rem;
    margin-top: 0.2rem;
    color: var(--color-text-secondary);
  }

  .filter .icon--ArrowUp {
    margin-top: 0.4rem;
  }
</style>
