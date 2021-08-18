<template>
  <div
    :class="[
      'icon',
      'icon--' + name,
    ]"
    v-html="svg"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import icons, { IconString } from '@/assets/icons';

export default defineComponent({
  name: 'Icon',
  props: {
    /**
     * Icon name
     */
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    /**
     * Svg html string
     */
    svg (): IconString {
      return icons[this.name];
    },
  },
});
</script>

<style>
  .icon {
    flex-shrink: 0;
    display: block;
    width: 1.6rem;
    color: inherit;
    position: relative;
  }

  .icon svg {
    fill: currentColor;
    display: block;
    width: 100%;
    height: auto;
    pointer-events: none;
  }
</style>
