<template>
  <div class="stream">
    <StreamPlayer
      :stream="stream"
      :playlist="playlist"
      @close="emit('close')"
    />

    <StreamChat
      :is-enable-top-offset="isMain"
      :channel="channel"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChannelEntity, LiveStream } from '@client/shared';
import StreamChat from './StreamChat.vue';
import StreamPlayer from './StreamPlayer.vue';

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
