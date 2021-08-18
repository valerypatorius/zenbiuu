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

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';

export default defineComponent({
  name: 'Checkbox',
  components: {
    Icon,
  },
  props: {
    /**
     * Input model value
     */
    value: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  methods: {
    /**
     * Emit "change" event
     */
    onChange (event: Event): void {
      this.$emit('change', event);
    },
  },
});
</script>

<style>
  .checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .checkbox input {
    display: none;
  }

  .checkbox input + span .icon {
    color: var(--color-transparent);
  }

  .checkbox input:checked + span {
    background-color: var(--color-button);
  }

  .checkbox input:checked + span .icon {
    color: var(--color-button-text);
  }

  .checkbox span {
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
  }

  .checkbox span .icon {
    width: 1.8rem;
    margin-top: -0.2rem;
  }

  .checkbox:hover input:not(:checked) + span .icon {
    color: var(--color-text-tertiary);
  }
</style>
