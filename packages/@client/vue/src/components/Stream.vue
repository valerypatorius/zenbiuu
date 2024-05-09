<template>
  <div class="stream">
    <Player
      :stream="stream"
      :playlist="playlist"
      @close="emit('close')"
    />

    <Chat
      :is-enable-top-offset="isMain"
      :channel="channel"
    />
  </div>
</template>

<script setup lang="ts">
import Player from './Player.vue';
import Chat from './Chat.vue';
import type { LiveStream, ChannelEntity } from '@client/shared';

defineProps<{
  channel?: ChannelEntity;
  stream?: LiveStream;
  isMain?: boolean;
  playlist?: (name: string, stream?: LiveStream) => Promise<string | undefined>;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.stream {
  display: grid;
  grid-template-columns: 1fr 360px;
  grid-template-rows: 100%;
}
</style>
