<template>
  <div
    :class="[
      'sidebar',
      {
        'sidebar--hidden': isSidebarHidden,
      },
    ]"
    :style="{
      width: sidebarWidth + 'px',
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
        <Search
          v-model:query="searchQuery"
          @input="onSearchInput"
          @clear="onSearchClear"
        />
      </section>

      <!-- Library -->
      <section class="sidebar__section">
        <sidebar-item
          icon="Library"
          :label="t('router.library')"
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
            :is-active="item.isActive"
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
            :label="isOfflineItemsShownAll ? t('sidebar.hideOffline') : t('sidebar.showOffline')"
            :is-secondary="true"
            @click="toggleOffline"
          />
        </div>

        <!-- Search error message -->
        <section v-if="isSearchError">
          <div class="sidebar__title">
            {{ t('sidebar.searchError') }}
          </div>
        </section>

        <!-- Search results -->
        <section
          v-if="foundItems.length"
          class="sidebar__section"
        >
          <div class="sidebar__title">
            {{ t('sidebar.foundItems') }}
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
        :is-badge="update !== undefined"
        :is-secondary="true"
        @click="toggleSettings"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useSidebar } from '../../useSidebar';
import { useLibrary } from '../../useLibrary';
import type { TwitchChannelFromSearch } from '@/src/modules/library/types';
import Search from '@/src/modules/ui/components/Search.vue';
import SidebarItem from '@/src/modules/library/components/sidebar/Item.vue';
import Resizer, { Axis } from '@/src/utils/resizer';
import Scroller from '@/src/utils/scroller';
import { RouteName } from '@/src/infrastructure/router/types';
import { useUser } from '@/src/modules/auth/useUser';
import { useInterface } from '@/src/infrastructure/interface/useInterface';
import { usePlayer } from '@/src/modules/channel/usePlayer';
import { useUpdater } from '@/src/infrastructure/updater/useUpdater';

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

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { isSettingsActive } = useInterface();
const { state: sidebarState } = useSidebar();
const { state: userState } = useUser();
const { update: updateLibrary, search: searchChannels, isReady: isLibraryReady, followedIds, followedChannels, followedStreams, foundStreams, lastUpdateTime } = useLibrary();
const { state: playerState } = usePlayer();
const { update } = useUpdater();

/** Minimum visible offline items count */
const MIN_OFFLINE_ITEMS_COUNT = 0;

/** Search input delay in ms */
const SEARCH_INPUT_DELAY = 500;

const scrollable = ref<HTMLDivElement>();

const offlineItemsCount = ref(MIN_OFFLINE_ITEMS_COUNT);

/** Current sidebar width, set by user */
const customSidebarWidth = ref(sidebarState.width);

const isSidebarResizing = ref(false);

const sidebarWidth = computed(() => {
  return isSidebarResizing.value ? customSidebarWidth.value : sidebarState.width;
});

/** Resizer instance */
const resizer = ref<Resizer>();

/** Scroller instance */
const scroller = ref<Scroller>();

/**
 * Current search query.
 * Used as search input model
 */
const searchQuery = ref('');

/** Typing timeout for search input */
const searchTimeout = ref<ReturnType<typeof setTimeout>>();

/** List of channels from search */
const searchResults = ref<TwitchChannelFromSearch[]>([]);

/** True, if search error is present */
const isSearchError = ref(false);

/** Logined user access token */
const userAccessToken = computed(() => userState.token);

/** Returns true, if current route is "library" */
const isLibrary = computed(() => route.name === RouteName.Library);

/**
 * Returns true, if sidebar should be hidden
 */
const isSidebarHidden = computed(() => {
  if (route.name === RouteName.Auth || !userAccessToken.value) {
    return true;
  }

  return !isLibrary.value && playerState.isHideSidebar;
});

/**
 * Returns true, if first string contains second substring
 */
function isContainsSubstring (str: string, substr: string): boolean {
  return str.toLowerCase().includes(substr.toLowerCase());
}

/** List of live channels to display */
const liveItems = computed(() => {
  return followedStreams.value
    .reduce<SidebarChannelItem[]>((result, stream) => {
      const userData = followedChannels.value.find((user) => user.id === stream.user_id);

      if (userData) {
        result.push({
          userId: userData.id,
          image: userData.profile_image_url,
          name: userData.display_name,
          isLive: true,
          isActive: userData.display_name === route.params.name,
          stream: {
            game: stream.game_name,
            cover: stream.thumbnail_url,
          },
        });
      }

      return result;
    }, [])
    .filter((item) => isContainsSubstring(item.name, searchQuery.value));
});

/**
 * List of all offline channels
 */
const offlineItems = computed(() => {
  const liveIds = liveItems.value.map((item) => item.userId);

  return followedIds.value
    .filter((followedId) => !liveIds.includes(followedId))
    .reduce<SidebarChannelItem[]>((result, followedId) => {
      const userData = followedChannels.value.find((user) => user.id === followedId);

      if (userData) {
        result.push({
          userId: userData.id,
          image: userData.profile_image_url,
          name: userData.display_name,
          isLive: false,
          isActive: userData.display_name === route.params.name,
        });
      }

      return result;
    }, [])
    .filter((item) => isContainsSubstring(item.name, searchQuery.value));
});

/**
 * List of channels found in search
 */
const foundItems = computed(() => {
  const sortedFound = [...searchResults.value].sort((a, b) => (b.is_live ? 1 : 0) - (a.is_live ? 1 : 0));

  return sortedFound
    .filter((foundItem) => {
      const isFollowedAndLive = liveItems.value.map((item) => item.userId).includes(foundItem.id);
      const isFollowedAndOffline = offlineItems.value.map((item) => item.userId).includes(foundItem.id);

      return !isFollowedAndLive && !isFollowedAndOffline;
    })
    .reduce((result: SidebarChannelItem[], foundItem: TwitchChannelFromSearch) => {
      const data: SidebarChannelItem = {
        userId: foundItem.id,
        image: foundItem.thumbnail_url,
        name: foundItem.display_name,
        isLive: foundItem.is_live,
        isActive: foundItem.display_name === route.params.name,
      };

      if (foundItem.is_live) {
        const stream = foundStreams.value.find((item) => item.user_id === foundItem.id);

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
});

/** List of currently displayed offline channels */
const visibleOfflineItems = computed(() => {
  if (searchQuery.value) {
    return offlineItems.value;
  }

  return offlineItems.value.slice(0, offlineItemsCount.value);
});

/** Count of currently hidden offline items */
const offlineItemsHiddenCount = computed(() => offlineItems.value.length - visibleOfflineItems.value.length);

/** Returns true, if all offline items are currently displayed */
const isOfflineItemsShownAll = computed(() => offlineItemsHiddenCount.value === 0);

updateLibrary();

onMounted(() => {
  resizer.value = new Resizer({
    axis: Axis.X,
    value: customSidebarWidth.value,
    limit: {
      min: SidebarWidth.Min,
      max: SidebarWidth.Max,
    },
    multiplier: -1,
    onResize: (value: number) => {
      isSidebarResizing.value = true;
      customSidebarWidth.value = value;
    },
    onStop: () => {
      isSidebarResizing.value = false;
      sidebarState.width = customSidebarWidth.value;
    },
  });

  /** Listen for scroll */
  if (scrollable.value) {
    scroller.value = new Scroller(scrollable.value);
  }
});

onBeforeUnmount(() => {
  resizer.value?.destroy();
  resizer.value = undefined;

  scroller.value?.destroy();
  scroller.value = undefined;
});

/**
 * Open selected channel screen
 */
function selectChannel (item: SidebarChannelItem): void {
  const cover = item.stream && item.stream.cover
    ? `${item.stream.cover.replace(/\{width\}/, '640').replace(/\{height\}/, '360')}?v=${lastUpdateTime.value}`
    : '';

  router.replace({
    name: RouteName.Channel,
    params: {
      name: item.name,
      id: item.userId,
    },
  });

  playerState.cover = cover;
}

/**
 * Toggle settings panel
 */
function toggleSettings (): void {
  isSettingsActive.value = !isSettingsActive.value;
}

/**
 * Open Library screen
 */
function openLibrary (): void {
  if (!isLibrary.value) {
    router.replace({ name: RouteName.Library });
  }
}

/**
 * Change sidebar width
 */
function resize (event: MouseEvent): void {
  resizer.value?.start(event.clientX);
}

/**
 * Show or hide offline items
 */
function toggleOffline (): void {
  offlineItemsCount.value = isOfflineItemsShownAll.value ? MIN_OFFLINE_ITEMS_COUNT : offlineItems.value.length;
}

/**
 * Perform search by query from input
 */
function onSearchInput (): void {
  if (!searchQuery.value) {
    searchResults.value = [];

    return;
  }

  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  isSearchError.value = false;

  searchTimeout.value = setTimeout(async () => {
    try {
      searchResults.value = await searchChannels(searchQuery.value);
    } catch (error) {
      searchResults.value = [];
      isSearchError.value = true;
    }
  }, SEARCH_INPUT_DELAY);
}

/**
 * Clear search results and query
 */
function onSearchClear (): void {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchResults.value = [];
  isSearchError.value = false;
}
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
    --icon-opacity: 0.7;

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
