<template>
  <div
    :class="[
      'sidebar',
      {
        'sidebar--hidden': isSidebarHidden,
      },
    ]"
    :style="{
      width: customSidebarWidth + 'px',
    }"
  >
    <template v-if="userAccessToken">
      <!-- Sidebar width resizer -->
      <div
        class="sidebar__resizer"
        @mousedown="resize"
      />

      <!-- Search -->
      <section class="sidebar__section">
        <sidebar-search
          v-model:query="searchQuery"
          @input="onSearchInput"
          @clear="onSearchClear"
        />
      </section>

      <!-- Library -->
      <section class="sidebar__section">
        <sidebar-item
          icon="Library"
          :label="$t('router.library')"
          :is-active="isLibrary"
          :is-secondary="!isLibrary"
          @click="openLibrary"
        />
      </section>
    </template>

    <!-- Scrollable channels list -->
    <div
      ref="scrollable"
      class="sidebar__channels scrollable"
    >
      <div
        v-if="userAccessToken"
        class="sidebar__scrollable"
      >
        <section
          v-if="liveItems.length || visibleOfflineItems.length"
          class="sidebar__section"
        >
          <!-- Live channels -->
          <sidebar-item
            v-for="item in liveItems"
            :key="item.userId"
            :image="item.image"
            :label="item.name"
            :details="item.stream ? item.stream.game : ''"
            :is-active="item.isActive"
            :is-loading="!isLibraryReady"
            @click="selectChannel(item)"
          />

          <!-- Offline channels -->
          <sidebar-item
            v-for="item in visibleOfflineItems"
            :key="item.userId"
            :image="item.image"
            :label="item.name"
            :is-disabled="true"
            :is-loading="!isLibraryReady"
            @click="selectChannel(item)"
          />
        </section>

        <!-- Sticky "Show offline channels" button -->
        <div
          v-if="isLibraryReady && !searchQuery"
          class="sidebar__section sidebar__section--sticky"
        >
          <sidebar-item
            v-if="isLibraryReady && !searchQuery"
            :icon="isOfflineItemsShownAll ? 'ChevronUp' : 'ChevronDown'"
            :label="isOfflineItemsShownAll ? $t('sidebar.hideOffline') : $t('sidebar.showOffline')"
            :is-secondary="true"
            @click="toggleOffline"
          />
        </div>

        <!-- Search error message -->
        <section v-if="isSearchError">
          <div class="sidebar__title">
            {{ $t('sidebar.searchError') }}
          </div>
        </section>

        <!-- Search results -->
        <section
          v-if="foundItems.length"
          class="sidebar__section"
        >
          <div class="sidebar__title">
            {{ $t('sidebar.foundItems') }}
          </div>

          <sidebar-item
            v-for="item in foundItems"
            :key="item.userId"
            :image="item.image"
            :label="item.name"
            :details="item.stream ? item.stream.game : ''"
            :is-active="item.isActive"
            :is-disabled="!item.isLive"
            :is-loading="!isLibraryReady"
            @click="selectChannel(item)"
          />
        </section>
      </div>
    </div>

    <!-- Settings -->
    <section class="sidebar__section sidebar__section--bottom">
      <sidebar-item
        icon="Settings"
        :is-badge="isUpdateAvailable"
        :title="isUpdateAvailable ? $t('settings.update.available') : undefined"
        :is-secondary="true"
        @click="toggleSettings"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SidebarItem from '@/src/components/sidebar/Item.vue';
import SidebarSearch from '@/src/components/sidebar/Search.vue';
import * as actions from '@/src/store/actions';
import Resizer, { Axis } from '@/src/utils/resizer';
import Scroller from '@/src/utils/scroller';
import { RouteName } from '@/types/renderer/router';
import { StreamType } from '@/types/renderer/library';
import { FOLLOWED_IDS } from '@/src/store/getters';
import date from '@/src/utils/date';
import interval from '@/src/utils/interval';
import { state } from '@/src/utils/hub';
import { AppUpdateStatus } from '@/types/hub';
import {
  GET_USER_FOLLOWS,
  GET_STREAMS,
  GET_USERS,
  SEARCH_CHANNELS,
} from '@/src/store/actions';
import type { TwitchStream, TwitchUserFollow, TwitchChannelFromSearch } from '@/types/renderer/library';
import type { IntervalManagerItem } from '@/src/utils/interval';

interface SidebarChannelItem {
  userId: string;
  image: string;
  name: string;
  isLive: boolean;
  isActive?: boolean;
  stream?: {
    game: string;
    cover?: string;
  };
};

/**
 * Sidebar width limits
 */
enum SidebarWidth {
  Min = 100,
  Max = 1000,
}

/**
 * Minimum visible offline items count
 */
const MIN_OFFLINE_ITEMS_COUNT = 0;

/**
 * Library reload interval
 */
const RELOAD_INTERVAL = 2 * date.Minute;

/**
 * Search input delay in ms
 */
const SEARCH_INPUT_DELAY = 500;

export default defineComponent({
  name: 'Sidebar',
  components: {
    SidebarItem,
    SidebarSearch,
  },
  data (): {
    customSidebarWidth: number;
    isShowOffline: boolean;
    offlineItemsCount: number;
    resizer: Resizer | null;
    scroller: Scroller | null;
    reloadInterval: IntervalManagerItem | null;
    searchQuery: string;
    searchTimeout: ReturnType<typeof setTimeout> | null;
    searchResults: TwitchChannelFromSearch[];
    isSearchError: boolean;
    } {
    return {
      /**
       * Current sidebar width, set by user
       */
      customSidebarWidth: this.$store.state.sidebar.width,

      /**
       * True, if all offline items should be displayed
       */
      isShowOffline: false,

      /**
       * Offline items count
       */
      offlineItemsCount: MIN_OFFLINE_ITEMS_COUNT,

      /**
       * Resizer instance
       */
      resizer: null,

      /**
       * Scroller instance
       */
      scroller: null,

      /**
       * Reload interval for channels in library
       */
      reloadInterval: null,

      /**
       * Current search query.
       * Used as search input model
       */
      searchQuery: '',

      /**
       * Typing timeout for search input
       */
      searchTimeout: null,

      /**
       * List of channels from search
       */
      searchResults: [],

      /**
       * True, if search error is present
       */
      isSearchError: false,
    };
  },
  computed: {
    /**
     * Logined user access token
     */
    userAccessToken (): string | null {
      return this.$store.state.user.token;
    },

    /**
     * Returns true, if app update is available
     */
    isUpdateAvailable (): boolean {
      return state.appUpdateStatus === AppUpdateStatus.Available ||
        state.appUpdateStatus === AppUpdateStatus.Downloading ||
        state.appUpdateStatus === AppUpdateStatus.ReadyForInstall;
    },

    /**
     * Returns true, if current route is "library"
     */
    isLibrary (): boolean {
      return this.$route.name === RouteName.Library;
    },

    /**
     * Returns true, if actual library content has been loaded
     */
    isLibraryReady (): boolean {
      return this.$store.state.library.isReady;
    },

    /**
     * Returns true, if sidebar should be hidden
     */
    isSidebarHidden (): boolean {
      if (this.$route.name === RouteName.Auth || !this.userAccessToken) {
        return true;
      }

      return !this.isLibrary && this.$store.state.player.isHideSidebar;
    },

    /**
     * List of ids, followed by logined user
     */
    followedIds (): string[] {
      return this.$store.getters[FOLLOWED_IDS];
    },

    /**
     * List of live channels to display
     */
    liveItems (): SidebarChannelItem[] {
      const { streams, users } = this.$store.state.library;

      return streams[StreamType.Followed]
        .reduce((result: SidebarChannelItem[], stream: TwitchStream) => {
          const userData = users.find((user) => user.id === stream.user_id);

          if (userData) {
            result.push({
              userId: userData.id,
              image: userData.profile_image_url,
              name: userData.display_name,
              isLive: true,
              isActive: userData.display_name === this.$route.params.name,
              stream: {
                game: stream.game_name,
                cover: stream.thumbnail_url,
              },
            });
          }

          return result;
        }, [])
        .filter((item) => this.isContainsSubstring(item.name, this.searchQuery));
    },

    /**
     * List of all offline channels
     */
    offlineItems (): SidebarChannelItem[] {
      const { followed, users } = this.$store.state.library;
      const liveIds = this.liveItems.map((item) => item.userId);

      return followed
        .filter((followedItem) => !liveIds.includes(followedItem.to_id))
        .reduce((result: SidebarChannelItem[], followedItem: TwitchUserFollow) => {
          const userData = users.find((user) => user.id === followedItem.to_id);

          if (userData) {
            result.push({
              userId: userData.id,
              image: userData.profile_image_url,
              name: userData.display_name,
              isLive: false,
            });
          }

          return result;
        }, [])
        .filter((item) => this.isContainsSubstring(item.name, this.searchQuery));
    },

    /**
     * List of channels found in search
     */
    foundItems (): SidebarChannelItem[] {
      const sortedFound = [...this.searchResults].sort((a, b) => (b.is_live ? 1 : 0) - (a.is_live ? 1 : 0));
      const { streams } = this.$store.state.library;

      return sortedFound
        .filter((foundItem) => {
          const isFollowedAndLive = this.liveItems.map((item) => item.userId).includes(foundItem.id);
          const isFollowedAndOffline = this.offlineItems.map((item) => item.userId).includes(foundItem.id);

          return !isFollowedAndLive && !isFollowedAndOffline;
        })
        .reduce((result: SidebarChannelItem[], foundItem: TwitchChannelFromSearch) => {
          const data: SidebarChannelItem = {
            userId: foundItem.id,
            image: foundItem.thumbnail_url,
            name: foundItem.display_name,
            isLive: foundItem.is_live,
            isActive: foundItem.display_name === this.$route.params.name,
          };

          if (foundItem.is_live) {
            const stream = streams[StreamType.Found].find((item) => item.user_id === foundItem.id);

            if (stream) {
              data.stream = {
                game: stream.game_name,
                cover: stream.thumbnail_url,
              };
            }
          }

          result.push(data);

          return result;
        }, []);
    },

    /**
     * Lizt of currently displayed offline channels
     */
    visibleOfflineItems (): SidebarChannelItem[] {
      if (this.searchQuery) {
        return this.offlineItems;
      }

      return this.offlineItems.slice(0, this.offlineItemsCount);
    },

    /**
     * Count of currently hidden offline items
     */
    offlineItemsHiddenCount (): number {
      return this.offlineItems.length - this.visibleOfflineItems.length;
    },

    /**
     * Returns true, if all offline items are currently displayed
     */
    isOfflineItemsShownAll (): boolean {
      return this.offlineItemsHiddenCount === 0;
    },
  },
  watch: {
    /**
     * When followed ids list is updated,
     * fetch library data
     */
    followedIds: {
      handler (newValue: string[], oldValue: string[]): void {
        const diff = newValue.filter((x) => !oldValue.includes(x));

        if (diff.length) {
          this.$store.dispatch(GET_STREAMS);
          this.$store.dispatch(GET_USERS);
        }
      },
      deep: true,
    },
  },
  created () {
    this.$store.dispatch(GET_USER_FOLLOWS);
    this.$store.dispatch(GET_USERS);

    /**
     * Start interval to update streams list
     */
    this.reloadInterval = interval.start(RELOAD_INTERVAL);

    this.reloadInterval.onupdate = () => {
      this.$store.dispatch(GET_STREAMS);
    };
  },
  mounted () {
    /** Enable resizer */
    this.resizer = new Resizer({
      axis: Axis.X,
      value: this.customSidebarWidth,
      limit: {
        min: SidebarWidth.Min,
        max: SidebarWidth.Max,
      },
      multiplier: -1,
      onResize: (value: number) => {
        this.customSidebarWidth = value;
      },
      onStop: () => {
        this.$store.dispatch(actions.SET_SIDEBAR_WIDTH, this.customSidebarWidth);
      },
    });

    /** Listen for scroll */
    this.scroller = new Scroller(this.$refs.scrollable as HTMLElement);
  },
  beforeUnmount () {
    /** Disable resizer */
    if (this.resizer) {
      this.resizer.destroy();
      this.resizer = null;
    }

    /** Stop listening for scroll */
    if (this.scroller) {
      this.scroller.destroy();
      this.scroller = null;
    }
  },
  methods: {
    /**
     * Open selected channel screen
     */
    selectChannel (item: SidebarChannelItem): void {
      const { lastUpdateTime } = this.$store.state.library;
      const cover = item.stream && item.stream.cover
        ? `${item.stream.cover.replace(/\{width\}/, '640').replace(/\{height\}/, '360')}?v=${lastUpdateTime}`
        : '';

      this.$router.replace({
        name: 'Channel',
        params: {
          name: item.name,
          id: item.userId,
          cover,
        },
      });
    },

    /**
     * Toggle settings panel
     */
    toggleSettings (): void {
      this.$store.dispatch(actions.TOGGLE_APP_SETTINGS);
    },

    /**
     * Open Library screen
     */
    openLibrary (): void {
      if (!this.isLibrary) {
        this.$router.replace({ name: 'Library' });
      }
    },

    /**
     * Change sidebar width
     */
    resize (event: MouseEvent): void {
      if (this.resizer) {
        this.resizer.start(event.clientX);
      }
    },

    /**
     * Show or hide offline items
     */
    toggleOffline (): void {
      this.offlineItemsCount = this.isOfflineItemsShownAll ? MIN_OFFLINE_ITEMS_COUNT : this.offlineItems.length;
    },

    /**
     * Perform search by query from input
     */
    onSearchInput (): void {
      if (!this.searchQuery) {
        this.searchResults = [];

        return;
      }

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.isSearchError = false;

      this.searchTimeout = setTimeout(() => {
        this.$store.dispatch(SEARCH_CHANNELS, this.searchQuery).then((list) => {
          this.searchResults = list;
        }).catch(() => {
          this.searchResults = [];
          this.isSearchError = true;
        });
      }, SEARCH_INPUT_DELAY);
    },

    /**
     * Clear search results and query
     */
    onSearchClear (): void {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchQuery = '';
      this.searchResults = [];
      this.isSearchError = false;
    },

    /**
     * Returns true, if first string contains second substring
     */
    isContainsSubstring (str: string, substr: string): boolean {
      return str.toLowerCase().includes(substr.toLowerCase());
    },
  },
});
</script>

<style>
  .sidebar {
    --default-width: 300px;
    --max-width: 50vw;
    --offset-x: var(--width-scrollbar);
    --offset-y: 1.6rem;
    --item-height: 4rem;
    --item-gap: 0.6rem;
    --size-icon: 2rem;
    --offset-icon: 1rem;

    width: var(--default-width);
    max-width: var(--max-width);
    height: 100%;
    padding-bottom: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .sidebar--hidden {
    max-width: 0;
  }

  .sidebar__channels {
    flex: 1;
  }

  /** Resizer */
  .sidebar__resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 5px;
    height: 100%;
    z-index: 1001;
    cursor: ew-resize;
  }

  .sidebar .sidebar-item:not(:last-child) {
    margin-bottom: var(--item-gap, 0.6rem);
  }

  /** Sections */
  .sidebar__section {
    display: flex;
    flex-direction: column;
    padding-left: var(--offset-x);
    padding-right: var(--offset-x);
    margin-bottom: var(--offset-y);
  }

  .sidebar__section:last-child {
    margin-bottom: 0;
  }

  .sidebar__section--bottom {
    padding-top: var(--item-gap);
    margin-bottom: 0;
  }

  .scrollable .sidebar__section {
    padding-right: 0;
  }

  .sidebar__section--sticky {
    position: sticky;
    bottom: 0;
    background-color: var(--color-background);
    z-index: 1;
  }

  /** Title */
  .sidebar__title {
    display: flex;
    align-items: baseline;
    font-weight: 400;
    margin-bottom: var(--offset-y);
    padding: 0 var(--offset-x);
    color: var(--color-text-secondary);
  }
</style>
