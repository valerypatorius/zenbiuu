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
      :title="$t('player.selectQuality')"
      @click="toggleListDisplay()"
    >
      <span class="picker__short-label">
        {{ activeItem ? activeItem.short : '' }}
      </span>
    </control>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Control from '@/src/components/player/Control.vue';

export interface PickerItem {
  index: number;
  label: string;
  short: string;
};

export default defineComponent({
  name: 'Picker',
  components: {
    Control,
  },
  props: {
    /**
     * Available items list
     */
    items: {
      type: Array as PropType<PickerItem[]>,
      default: () => [],
    },

    /**
     * Active item id
     */
    active: {
      type: Number,
      default: -1,
    },

    /**
     * True, if picker should be disabled
     */
    isDisabled: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['change'],
  data (): {
    isListVisible: boolean;
    } {
    return {
      /**
       * If true, items list is visible
       */
      isListVisible: false,
    };
  },
  computed: {
    /**
     * Returns true, if interface blur is enabled in settings
     */
    isBlurEnabled (): boolean {
      return this.$store.state.app.settings.isBlurEnabled;
    },

    /**
     * Active item
     */
    activeItem (): PickerItem | null {
      return this.items.find((item) => item.index === this.active) || null;
    },

    /**
     * Sorted items list
     */
    itemsList (): PickerItem[] {
      return [...this.items].sort((a, b) => b.index - a.index);
    },
  },
  methods: {
    /**
     * Toggle items list display
     */
    toggleListDisplay (value?: boolean): void {
      this.isListVisible = typeof value === 'boolean' ? value : !this.isListVisible;

      if (this.isListVisible) {
        document.addEventListener('mousedown', this.handleClickOutsitePicker);
      } else {
        document.removeEventListener('mousedown', this.handleClickOutsitePicker);
      }
    },

    /**
     * Hide items list, when clicked outside picker
     */
    handleClickOutsitePicker (event: MouseEvent): void {
      if ((this.$refs.picker as HTMLElement).contains(event.target as Node)) {
        return;
      }

      this.toggleListDisplay(false);
    },

    /**
     * Emit "change" event and hide dropdown
     */
    onItemClick (item: PickerItem): void {
      this.toggleListDisplay(false);
      this.$emit('change', item);
    },
  },
});
</script>

<style>
  .picker--disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .picker--disabled .picker__list {
    display: none;
  }

  .picker--with-blur .picker__list {
    background-color: var(--color-overlay-full);
    backdrop-filter: blur(15px);
  }

  .picker:hover .picker__list {
    visibility: visible;
    opacity: 1;
  }

  .picker__list {
    width: 100%;
    position: absolute;
    right: 0;
    bottom: 100%;
    margin-bottom: 1rem;
    background-color: var(--color-overlay-full);
    border-radius: var(--border-radius);
    z-index: 1;
  }

  .picker__item {
    padding: 1rem 1.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .picker__item:hover {
    background-color: var(--color-control-active);
  }

  .picker__item--active {
    pointer-events: none;
    color: var(--color-text);
    background-color: var(--color-control-active);
    font-weight: 500;
  }

  .picker__item:first-child {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  .picker__item:last-child {
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }

  .picker__short-label {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 0;
  }
</style>
