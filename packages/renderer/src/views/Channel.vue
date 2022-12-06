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
      :cover="playerCover"
    />

    <Chat
      :channel-name="channelName"
      :channel-id="channelId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import Chat from '@/src/components/Chat.vue';
import Player from '@/src/components/Player.vue';
import type { RootSchema, ModulesSchema } from '@/types/schema';

/**
 * Define store and router instances
 */
const store = useStore<RootSchema & ModulesSchema>();
const route = useRoute();

/** Current route params */
const { id, name, cover } = route.params;

/** Channel name in lowercase format */
const channelName = Array.isArray(name) ? name[0].toLowerCase() : name.toLowerCase();

/** Channel numeric id */
const channelId = Array.isArray(id) ? id[0] : id;

/** Player cover image */
const playerCover = Array.isArray(cover) ? cover[0] : cover;

/** Channel screen layout type */
const layoutType = computed(() => store.state.player.layout);
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
