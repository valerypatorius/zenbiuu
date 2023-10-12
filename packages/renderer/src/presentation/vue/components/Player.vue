<template>
  <div class="player">
    <div
      class="player__background"
      :style="{
        'background-image': `url(${cover})`,
      }"
    />

    <video
      :poster="cover"
      controls
    />

    <Button
      class="player__close"
      @click="emit('close')"
    >
      Close
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from './ui/Button.vue';

defineProps<{
  cover?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<style lang="postcss">
.player {
  background-color: #000;
  position: relative;
  z-index: 1;
  overflow: hidden;

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: 50% 50%;
    opacity: 0.3;
    filter: blur(20px);
    transform: scale(1.25);
    z-index: -1;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
</style>
