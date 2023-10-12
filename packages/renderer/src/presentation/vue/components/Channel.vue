<template>
  <div class="channel">
    <Player
      :cover="cover"
      @close="emit('close')"
    />

    <Chat />
  </div>
</template>

<script setup lang="ts">
import Player from './Player.vue';
import Chat from './Chat.vue';

defineProps<{
  cover?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.channel {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: 100%;
}
</style>
