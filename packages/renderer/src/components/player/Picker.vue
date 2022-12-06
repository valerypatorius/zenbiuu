<template>
  <div
    ref="picker"
    :class="[
      'picker',
      {
        'picker--with-blur': isBlurEnabled,
        'picker--disabled': isDisabled,
      },
    ]"
  >
    <!-- Items list -->
    <div
      v-show="isListVisible"
      class="picker__list"
    >
      <div
        v-for="item in itemsList"
        :key="item.index"
        :class="[
          'picker__item',
          {
            'picker__item--active': item.index === active,
          },
        ]"
        @click="onItemClick(item)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- Toggle button with icon -->
    <control
      :is-active="isListVisible"
      :title="t('player.selectQuality')"
      @click="toggleListDisplay()"
    >
      <span class="picker__short-label">
        {{ activeItem ? activeItem.short : '' }}
      </span>
    </control>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import Control from '@/src/components/player/Control.vue';
import type { RootSchema, ModulesSchema } from '@/types/schema';

export interface PickerItem {
  index: number;
  label: string;
  short: string;
};

const props = withDefaults(defineProps<{
  /** Available items list */
  items: PickerItem[];

  /** Active item id */
  active: number;

  /** True, if picker should be disabled */
  isDisabled: boolean;
}>(), {
  active: -1,
  isDisabled: true,
});

const emit = defineEmits<{
  (e: 'change', item: PickerItem): void;
}>();

const store = useStore<RootSchema & ModulesSchema>();
const { t } = useI18n();

const picker = ref<HTMLElement>();

/** If true, items list is visible */
const isListVisible = ref(false);

/** Returns true, if interface blur is enabled in settings */
const isBlurEnabled = computed(() => store.state.app.settings.isBlurEnabled);

/** Active item */
const activeItem = computed(() => props.items.find((item) => item.index === props.active) || null);

/** Sorted items list */
const itemsList = computed(() => [...props.items].sort((a, b) => b.index - a.index));

/**
 * Toggle items list display
 */
function toggleListDisplay (value?: boolean): void {
  isListVisible.value = typeof value === 'boolean' ? value : !isListVisible.value;

  if (isListVisible.value) {
    document.addEventListener('mousedown', handleClickOutsitePicker);
  } else {
    document.removeEventListener('mousedown', handleClickOutsitePicker);
  }
}

/**
 * Hide items list, when clicked outside picker
 */
function handleClickOutsitePicker (event: MouseEvent): void {
  if (picker.value?.contains(event.target as Node)) {
    return;
  }

  toggleListDisplay(false);
}

/**
 * Emit "change" event and hide dropdown
 */
function onItemClick (item: PickerItem): void {
  toggleListDisplay(false);
  emit('change', item);
}
</script>

<style lang="postcss">
  .picker {
    &--disabled {
      pointer-events: none;
      opacity: 0.5;

      .picker__list {
        display: none;
      }
    }

    &--with-blur {
      .picker__list {
        background-color: var(--color-overlay-full);
        backdrop-filter: blur(15px);
      }
    }

    &:hover .picker__list {
      visibility: visible;
      opacity: 1;
    }

    &__list {
      width: 100%;
      position: absolute;
      right: 0;
      bottom: 100%;
      margin-bottom: 1rem;
      background-color: var(--color-overlay-full);
      border-radius: var(--border-radius);
      z-index: 1;
    }

    &__item {
      padding: 1rem 1.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;

      &:hover {
        background-color: var(--color-control-active);
      }

      &--active {
        pointer-events: none;
        color: var(--color-text);
        background-color: var(--color-control-active);
        font-weight: 500;
      }

      &:first-child {
        border-radius: var(--border-radius) var(--border-radius) 0 0;
      }

      &:last-child {
        border-radius: 0 0 var(--border-radius) var(--border-radius);
      }
    }

    &__short-label {
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 0;
    }
  }
</style>
