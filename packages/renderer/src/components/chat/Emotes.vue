<template>
  <div
    :class="[
      'chat-emotes',
      {
        'chat-emotes--with-blur': isBlurEnabled,
      },
    ]"
  >
    <div class="chat-emotes__tabs">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        :class="[
          'chat-emotes__tab',
          {
            'chat-emotes__tab--active': activeTab === tab.name,
          },
        ]"
        @click="activeTab = tab.name"
      >
        <icon
          v-if="tab.icon"
          :name="tab.icon"
        />
        {{ tab.label ?? '' }}
      </div>
    </div>

    <div class="scrollable">
      <div class="chat-emotes__list">
        <div
          v-for="(emote, name) in activeTabEmotes"
          :key="name"
        >
          <div
            class="chat-emote"
            :title="name"
            @click="$emit('select', name)"
          >
            <img
              :src="emote.url"
              :alt="name"
              loading="lazy"
            >

            <div
              class="chat-emote__pin"
              :title="$t('chat.form.pin', { emote: name })"
              @click.stop="pinEmote"
            >
              <icon name="Heart" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';
import { EmoteProvider, ChatEmote } from '@/types/renderer/chat';

export default defineComponent({
  name: 'ChatEmotes',
  components: {
    Icon,
  },
  // props: {
  // },
  emits: ['select'],
  data () {
    return {
      activeTab: 'twitch',
    };
  },
  computed: {
    /**
     * Returns true, if interface blur is enabled in settings
     */
    isBlurEnabled (): boolean {
      return this.$store.state.app.settings.isBlurEnabled;
    },

    customEmotes () {
      return this.$store.state.chat.emotes;
    },

    activeTabEmotes () {
      return this.customEmotes[this.activeTab];
    },

    tabs () {
      const availableProviders = Object.keys(this.customEmotes).filter((providerName) => Object.keys(this.customEmotes[providerName]).length).map((providerName) => ({
        label: EmoteProvider[providerName],
        name: providerName,
      }));

      return [
        {
          icon: 'Heart',
        },
        ...availableProviders,
      ];
    },
  },
  methods: {
    pinEmote (event: MouseEvent) {
    },
  },
});
</script>

<style>
  .chat-emotes {
    --emote-size: 2.8rem;
    --cell-size: 4.8rem;

    background-color: var(--color-overlay-full);
    border-radius: var(--border-radius);
    user-select: none;
    height: 31rem;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  .chat-emotes--with-blur {
    background-color: var(--color-overlay);
    backdrop-filter: blur(15px);
  }

  .chat-emotes__tabs {
    display: flex;
    gap: 0.8rem;
    padding: 1rem;
  }

  .chat-emotes__tab {
    color: var(--color-text-secondary);
    font-weight: 500;
    cursor: pointer;
    padding: 0.2rem 0.8rem;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
  }

  .chat-emotes__tab:hover {
    background-color: var(--color-control-semiactive);
  }

  .chat-emotes__tab--active {
    color: var(--color-text);
    background-color: var(--color-control-active);
    pointer-events: none;
  }

  .chat-emotes__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--cell-size), 1fr));
    padding: 0.4rem 1rem 1rem;
  }

  .chat-emote {
    height: var(--cell-size);
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: var(--border-radius);
  }

  .chat-emote:hover {
    background-color: var(--color-control-active);
    position: relative;
  }

  .chat-emote img {
    min-width: 0;
  }

  .chat-emote__pin {
    --size: 2rem;

    display: none;
    width: var(--size);
    height: var(--size);
    position: absolute;
    top: -0.4rem;
    right: -0.4rem;
    color: var(--color-text);
    opacity: 0;
  }

  .chat-emote:hover .chat-emote__pin {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-emote__pin .icon {
    width: var(--size);
    position: absolute;
  }

  .chat-emote__pin:hover {
    opacity: 1;
  }
</style>
