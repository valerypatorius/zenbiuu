<template>
  <label class="checkbox">
    <input
      type="checkbox"
      tabindex="-1"
      :checked="value"
      @change="onChange"
    >

    <span>
      <icon name="Check" />
    </span>

    <slot />
  </label>
</template>

<script setup lang="ts">
import Icon from '@/src/components/ui/Icon.vue';

withDefaults(defineProps<{
  /** Checkbox value */
  value: boolean;
}>(), {
  value: false,
});

const emit = defineEmits<{
  (name: 'change', payload: Event): void;
}>();

/**
 * Emit "change" event when checkbox value is changed
 * @param payload - event payload
 */
function onChange (payload: Event) {
  emit('change', payload);
}
</script>

<style lang="postcss">
  .checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;

    input {
      display: none;

      + span .icon {
        color: var(--color-transparent);
      }

      &:checked {
        + span {
          background-color: var(--color-button);

          .icon {
            color: var(--color-button-text);
          }
        }
      }
    }

    span {
      --size: 2rem;
      flex-shrink: 0;
      width: var(--size);
      height: var(--size);
      background-color: var(--color-control-active);
      border-radius: 0.4rem;
      margin-right: 1rem;
      margin-top: 0.1rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon {
        width: 1.8rem;
        margin-top: -0.2rem;
      }
    }

    &:hover {
      input:not(:checked) + span .icon {
        color: var(--color-text-tertiary);
      }
    }
  }
</style>
