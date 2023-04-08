<template>
  <div
    ref="container"
    :class="[
      'emotes',
      isBlurEnabled && 'emotes--with-blur',
    ]"
  >
    <!-- Display loader, if emotes list is not ready -->
    <Loader v-if="isEmptyEmotes" />

    <template v-else>
      <!-- Navigation panel -->
      <div class="emotes__header">
        <!-- Tabs -->
        <div
          v-for="tab, tabId in tabs"
          :key="tab.label"
          :class="[
            'emotes__tab',
            tab.isDisabled && 'emotes__tab--disabled',
            activeTabId === tabId && 'emotes__tab--active',
          ]"
          :title="'icon' in tab ? tab.label : undefined"
          @click="setActiveTabId(tabId)"
        >
          <!-- If icon is provided, use just it -->
          <Icon
            v-if="'icon' in tab"
            :name="tab.icon"
          />

          <!-- Otherwise use text label -->
          <template v-else>
            {{ tab.label }}
          </template>
        </div>
      </div>

      <!-- Scrollable emotes list -->
      <div class="emotes__list scrollable">
        <!-- Hot emotes -->
        <div
          v-if="activeTabId === 'hot'"
          class="emotes__section"
        >
          <Emote
            v-for="emote in hotEmotes"
            :key="emote.name"
            v-bind="emote"
            @click="emit('select', $event)"
          />
        </div>

        <!-- Recent emotes -->
        <div
          v-if="activeTabId === 'recent'"
          class="emotes__section"
        >
          <Emote
            v-for="emote in recentEmotes"
            :key="emote.name"
            v-bind="emote"
            @click="emit('select', $event)"
          />
        </div>

        <!-- All emotes -->
        <template v-if="activeTabId === 'all'">
          <template
            v-for="(charEmotes, char) in emotesByChar"
            :key="char"
          >
            <div class="emotes__title">
              {{ char }}
            </div>

            <div class="emotes__section">
              <Emote
                v-for="emote in charEmotes"
                :key="emote.name"
                v-bind="emote"
                @click="emit('select', $event)"
              />
            </div>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEmotes } from '../../useEmotes';
import Emote from './Emote';
import { useApp } from '@/src/modules/core/useApp';
import Loader from '@/src/modules/ui/components/Loader.vue';
import Icon from '@/src/modules/ui/components/Icon.vue';

const emit = defineEmits<{
  (event: 'select', emoteName: string): void;
  (event: 'leave'): void;
}>();

const container = ref<HTMLDivElement>();

const { t } = useI18n();

const { emotesByChar, hotEmotes, recentEmotes } = useEmotes();
const { state: appState } = useApp();

const isBlurEnabled = computed(() => appState.settings.isBlurEnabled);
const isEmptyEmotes = computed(() => Object.keys(emotesByChar.value).length === 0);
const isHotEmotesPresent = computed(() => hotEmotes.value.length > 0);
const isRecentEmotesPresent = computed(() => recentEmotes.value.length > 0);

const tabs = computed(() => {
  return {
    hot: {
      label: t('chat.emotes.hot'),
      icon: 'Hot',
      isDisabled: !isHotEmotesPresent.value,
    },
    recent: {
      label: t('chat.emotes.recent'),
      icon: 'Time',
      isDisabled: !isRecentEmotesPresent.value,
    },
    all: {
      label: t('chat.emotes.all'),
      isDisabled: isEmptyEmotes.value,
    },
  } as const;
});

const activeTabId = ref<keyof typeof tabs.value>();

/**
 * @todo Optimize large emotes list mounting
 */
function setActiveTabId (value: keyof typeof tabs.value): void {
  activeTabId.value = value;
}

function setDefaultActiveTab () {
  if (isHotEmotesPresent.value) {
    setActiveTabId('hot');
  } else if (isRecentEmotesPresent.value) {
    setActiveTabId('recent');
  } else {
    setActiveTabId('all');
  }
}

onMounted(() => {
  setDefaultActiveTab();
});

onActivated(() => {
  setDefaultActiveTab();
});
</script>

<style lang="postcss">
  .emotes {
    width: 100%;
    background-color: var(--color-overlay-full);
    border-radius: var(--border-radius);
    padding-right: 0;
    overflow: hidden;

    &--with-blur {
      background-color: var(--color-overlay);
      backdrop-filter: blur(15px);
    }

    .loader {
      margin: 2rem auto;
    }

    &__header {
      display: flex;
      gap: 0.8rem;
      padding: 1rem;
      padding-right: var(--width-scrollbar);
    }

    &__tab {
      --icon-opacity: 0.7;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0.2rem 0.8rem;
      border-radius: var(--border-radius);

      &--active {
        background-color: var(--color-control-active);
        color: var(--color-text);
        pointer-events: none;
      }

      &--disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      &:hover {
        background-color: var(--color-control-semiactive);
      }

      &:last-child:not(:only-child) {
        margin-left: auto;
      }
    }

    &__list {
      padding-left: 1rem;
      padding-bottom: 1rem;
      height: 26rem;
    }

    &__title {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 1rem;
      padding: 0 1rem;
      color: var(--color-text-tertiary);
    }

    &__section {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(4.8rem, 1fr));

      &::after {
        content: '';
        flex: 1;
      }

      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
  }

  .emote-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: var(--border-radius);
    padding: 0.8rem 0.4rem;

    img {
      max-width: 100%;
    }

    &:hover {
      background-color: var(--color-control-semiactive);
    }
  }
</style>
