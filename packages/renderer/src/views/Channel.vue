<template>
  <div
    :class="[
      'channel',
      'channel--' + layoutType,
    ]"
  >
    <Player
      :channel-name="channelName"
      :channel-id="channelId"
    />

    <Chat
      :channel-name="channelName"
      :channel-id="channelId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Chat from '@/src/components/Chat.vue';
import Player from '@/src/components/Player.vue';
import { usePlayer } from '../store/usePlayer';

/**
 * Define store and router instances
 */
const route = useRoute();
const { state: playerState } = usePlayer();

/** Current route params */
const { id, name } = route.params;

/** Channel name in lowercase format */
const channelName = Array.isArray(name) ? name[0].toLowerCase() : name.toLowerCase();

/** Channel numeric id */
const channelId = Array.isArray(id) ? id[0] : id;

/** Channel screen layout type */
const layoutType = computed(() => playerState.layout);
</script>

<style>
  .channel {
    display: grid;
    min-height: 0;
  }

  .channel--horizontal {
    grid-template-columns: 1fr auto;
  }

  .channel--vertical {
    grid-template-rows: 1fr auto;
  }

  .channel--vertical .player::before {
    content: '';
    display: block;
    padding-bottom: var(--ratio-video);
  }
</style>
