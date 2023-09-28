<template>
  <div
    ref="scrollableNode"
    class="library scrollable"
  >
    <div class="library__content">
      <Filters
        @change="setSorting"
      />

      <div class="grid">
        <Preview
          v-for="stream in sortedStreams"
          :key="stream.user_login"
          :is-loading="!isReady"
          :data="stream"
          @click="onChannelSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useLibrary } from './useLibrary';
import Filters from '@/src/modules/library/components/Filters.vue';
import Preview from '@/src/modules/library/components/Preview.vue';
import Scroller from '@/src/utils/scroller';
import { TwitchStream, Sorting } from '@/src/modules/library/types';
import { unixtime } from '@/src/utils/date';
import { usePlayer } from '@/src/modules/channel/usePlayer';
import { RouteName } from '@/src/infrastructure/router/types';

/**
 * Define store and router instances
 */
const router = useRouter();
const { state: libraryState, isReady, followedStreams } = useLibrary();
const { state: playerState } = usePlayer();

/** Current library sorting type */
const sorting = computed(() => libraryState.sorting);

/** Sorting rule, based on current sorting type */
const sortingRule = computed(() => {
  switch (sorting.value) {
    case Sorting.DurationAsc:
      return (a: TwitchStream, b: TwitchStream) => unixtime(b.started_at) - unixtime(a.started_at);
    case Sorting.DurationDesc:
      return (a: TwitchStream, b: TwitchStream) => unixtime(a.started_at) - unixtime(b.started_at);
    case Sorting.ChannelAsc:
      return (a: TwitchStream, b: TwitchStream) => a.user_login.localeCompare(b.user_login);
    case Sorting.ChannelDesc:
      return (a: TwitchStream, b: TwitchStream) => b.user_login.localeCompare(a.user_login);
    case Sorting.GameAsc:
      return (a: TwitchStream, b: TwitchStream) => a.game_name.localeCompare(b.game_name);
    case Sorting.GameDesc:
      return (a: TwitchStream, b: TwitchStream) => b.game_name.localeCompare(a.game_name);
    case Sorting.ViewersAsc:
      return (a: TwitchStream, b: TwitchStream) => a.viewer_count - b.viewer_count;
    case Sorting.ViewersDesc:
    default:
      return (a: TwitchStream, b: TwitchStream) => b.viewer_count - a.viewer_count;
  }
});

/** Streams list, sorted by active rule */
const sortedStreams = computed(() => [...followedStreams.value].sort(sortingRule.value));

/** Set sorting type */
const setSorting = (value: Sorting) => {
  libraryState.sorting = value;
};

/** Scroller instance */
const scroller = ref<Scroller | null>(null);

/** Scrollable library element */
const scrollableNode = ref<HTMLElement | null>(null);

/**
 * Initialize scroller, when component is mounted
 */
onMounted(() => {
  if (!scrollableNode.value) {
    return;
  }

  scroller.value = new Scroller(scrollableNode.value);
});

/**
 * Destroy scroller, when component is unmounted
 */
onBeforeUnmount(() => {
  if (!scroller.value) {
    return;
  }

  scroller.value.destroy();
  scroller.value = null;
});

/** Open channel screen */
const onChannelSelect = (name: string, id: string, cover: string) => {
  router.replace({
    name: RouteName.Channel,
    params: {
      name,
      id,
    },
  });

  playerState.cover = cover;
};
</script>

<style>
  .library__title {
    font-size: 2rem;
    line-height: 1em;
    margin-bottom: 4rem;
    font-weight: 700;
  }

  .library__content {
    padding: 0 var(--offset-window) 3rem;
  }

  .library .filters {
    padding-bottom: 1.6rem;
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--color-background);
  }

  .grid {
    --size-offset: 6rem;
    --size-grid: 300px;

    display: grid;
    gap: var(--size-offset) calc(var(--size-offset) * 1.2);
    justify-content: start;
    grid-template-columns: repeat(auto-fill, minmax(var(--size-grid), 1fr));
  }
</style>
