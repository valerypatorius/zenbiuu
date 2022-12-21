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
          :is-loading="!isLibraryReady"
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
import Filters from '@/src/modules/library/components/Filters.vue';
import Preview from '@/src/modules/library/components/Preview.vue';
import Scroller from '@/src/utils/scroller';
import { StreamType, TwitchStream, Sorting } from '@/types/renderer/library';
import { unixtime } from '@/src/utils/date';
import { useLibrary } from '@/src/store/useLibrary';
import { usePlayer } from '@/src/store/usePlayer';
import { RouteName } from '@/types/renderer/router';

/**
 * Define store and router instances
 */
const router = useRouter();
const { state: libraryState } = useLibrary();
const { state: playerState } = usePlayer();

/** True, if actual library content has been loaded */
const isLibraryReady = computed(() => libraryState.isReady);

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

/** Streams list */
const streams = computed(() => libraryState.streams[StreamType.Followed]);

/** Streams list, sorted by active rule */
const sortedStreams = computed(() => [...streams.value].sort(sortingRule.value));

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
