<template>
  <label class="radio">
    <input
      :id="`radio-${id}`"
      type="radio"
      tabindex="-1"
      :name="name"
      :checked="checked"
      @change="onChange"
    >

    <span />

    <slot />
  </label>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  /** Input id */
  id: string;

  /** Input model value */
  value: string;

  /** Input name */
  name: string;

  /** Checked state */
  checked: boolean;
}>(), {
  checked: false,
});

const emit = defineEmits<{
  (name: 'change', payload: Event): void;
}>();

/**
 * Emit "change" event when radio value is changed
 * @param payload - event payload
 */
function onChange (payload: Event) {
  emit('change', payload);
}
</script>

<style lang="postcss">
  .radio {
    display: flex;
    align-items: center;
    cursor: pointer;

    input {
      display: none;

      + span::before {
        content: '';
        width: 0.4rem;
        height: 0.4rem;
        background-color: var(--color-transparent);
        border-radius: 50%;
      }

      &:checked + span {
        background-color: var(--color-button);

        &::before {
          background-color: var(--color-button-text);
        }
      }
    }

    span {
      --size: 2rem;
      flex-shrink: 0;
      width: var(--size);
      height: var(--size);
      background-color: var(--color-control-active);
      border-radius: 50%;
      margin-right: 1rem;
      margin-top: 0.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &:hover input:not(:checked) + span::before {
      background-color: var(--color-text-tertiary);
    }
  }
</style>
