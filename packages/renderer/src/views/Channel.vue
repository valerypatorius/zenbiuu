<template>
  <div
    :class="[
      'channel',
      'channel--' + layoutType,
    ]"
  >
    <player
      :channel-name="channelName"
      :channel-id="channelId"
      :cover="playerCover"
    />

    <chat
      :channel-name="channelName"
      :channel-id="channelId"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Chat from '@/src/components/Chat.vue';
import Player from '@/src/components/Player.vue';

export default defineComponent({
  name: 'Channel',
  components: {
    Chat,
    Player,
  },
  computed: {
    /**
     * Channel name in lowercase format
     */
    channelName (): string {
      const nameParam = this.$route.params.name;

      return typeof nameParam === 'string'
        ? nameParam.toLowerCase()
        : nameParam[0].toLowerCase();
    },

    /**
     * Channel numeric id
     */
    channelId (): string {
      const idParam = this.$route.params.id;

      return typeof idParam === 'string'
        ? idParam
        : idParam[0];
    },

    /**
     * Player cover image
     */
    playerCover (): string {
      const { cover } = this.$route.params;

      return Array.isArray(cover) ? cover[0] : cover;
    },

    /**
     * Channel screen layout type
     */
    layoutType (): string {
      return this.$store.state.player.layout;
    },
  },
});
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
