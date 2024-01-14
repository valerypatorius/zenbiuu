<template>
  <div class="stream">
    <Player
      :cover="cover"
      :channel-name="channelName"
      :playlist="playlist"
      @close="emit('close')"
    />

    <Chat
      :is-enable-top-offset="isMain"
      :channel-name="channelName"
      :channel-id="channelId"
    />
  </div>
</template>

<script setup lang="ts">
import Player from './Player.vue';
import Chat from './Chat.vue';

defineProps<{
  channelName: string;
  channelId: string;
  cover?: string;
  isMain?: boolean;
  playlist?: (channel: string) => Promise<string | undefined>;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.stream {
  display: grid;
  grid-template-columns: 1fr 360px;
  grid-template-rows: 100%;
}
</style>
