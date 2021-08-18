<template>
  <div
    ref="scrollable"
    class="library scrollable"
  >
    <div class="library__content">
      <filters
        @change="setSorting"
      />

      <div class="grid">
        <preview
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

<script lang="ts">
import { defineComponent } from 'vue';
import Filters from '@/src/components/Filters.vue';
import Preview from '@/src/components/Preview.vue';
import Scroller from '@/src/utils/scroller';
import { StreamType, TwitchStream, Sorting } from '@/types/renderer/library';
import { SET_LIBRARY_SORTING } from '@/src/store/actions';
import { unixtime } from '@/src/utils/date';

export default defineComponent({
  name: 'Library',
  components: {
    Filters,
    Preview,
  },
  data (): {
    scroller: Scroller | null;
    } {
    return {
      /**
       * Scroller instance
       */
      scroller: null,
    };
  },
  computed: {
    /**
     * Streams list
     */
    streams (): TwitchStream[] {
      return this.$store.state.library.streams[StreamType.Followed];
    },

    /**
     * Returns true, if actual library content has been loaded
     */
    isLibraryReady (): boolean {
      return this.$store.state.library.isReady;
    },

    /**
     * Current library sorting type
     */
    sorting (): Sorting {
      return this.$store.state.library.sorting;
    },

    /**
     * Sorting rule, based on current sorting type
     */
    sortingRule () {
      switch (this.sorting) {
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
    },

    /**
     * Streams list, sorted by active rule
     */
    sortedStreams (): TwitchStream[] {
      return [...this.streams].sort(this.sortingRule);
    },
  },
  mounted () {
    this.scroller = new Scroller(this.$refs.scrollable as HTMLElement);
  },
  beforeUnmount () {
    if (this.scroller) {
      this.scroller.destroy();
      this.scroller = null;
    }
  },
  methods: {
    /**
     * Open channel screen
     */
    onChannelSelect (name: string, id: number, cover: string) {
      this.$router.replace({
        name: 'Channel',
        params: {
          name,
          id,
          cover,
        },
      });
    },

    /**
     * Set sorting type
     */
    setSorting (value: Sorting) {
      this.$store.dispatch(SET_LIBRARY_SORTING, value);
    },
  },
});
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
