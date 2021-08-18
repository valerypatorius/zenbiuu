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

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Radio',
  components: {
  },
  props: {
    /**
     * Input id
     */
    id: {
      type: String,
      default: '',
    },

    /**
     * Input model value
     */
    value: {
      type: String,
      default: '',
    },

    /**
     * Input name
     */
    name: {
      type: String,
      default: '',
    },

    /**
     * Checked state
     */
    checked: {
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
  .radio {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .radio input {
    display: none;
  }

  .radio input + span::before {
    content: '';
    width: 0.4rem;
    height: 0.4rem;
    background-color: var(--color-transparent);
    border-radius: 50%;
  }

  .radio input:checked + span {
    background-color: var(--color-button);
  }

  .radio input:checked + span::before {
    background-color: var(--color-button-text);
  }

  .radio span {
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

  .radio:hover input:not(:checked) + span::before {
    background-color: var(--color-text-tertiary);
  }
</style>
