<template>
  <div
    ref="chat"
    :class="[
      'chat',
      {
        'chat--hidden': isHorizontalLayoutType && isChatHidden,
      },
    ]"
    :style="{
      width: chatWidth,
      height: chatHeight,
    }"
  >
    <div
      ref="scrollable"
      class="chat__content scrollable"
      @mouseenter="setChatPause(true)"
      @mouseleave="setChatPause(false)"
    >
      <div class="chat__messages">
        <!-- Empty chat message -->
        <div
          v-if="!messages.length && userName"
          class="chat__dummy"
        >
          {{ $t('chat.joinedAs') }} {{ userName }}
        </div>

        <!-- Messages list -->
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'chat-message',
            {
              'chat-message--removed': message.isRemoved,
            },
          ]"
          :style="getChatMessageStyles(message)"
          :data-id="message.id"
        >
          <!-- Author badges -->
          <div
            v-if="message.badges && message.badges.length"
            class="chat-message__badges"
          >
            <div
              v-for="badge in message.badges"
              :key="badge"
              :class="[
                'badge',
                'badge--' + badge,
              ]"
            />
          </div>

          <!-- Message author -->
          <span class="chat-message__author">
            {{ message.author }}{{ message.text.isColored ? ' ' : ': ' }}
          </span>

          <!-- Message text -->
          <span
            class="chat-message__content"
            v-html="message.text.value"
          />
        </div>

        <!-- Last message horizon -->
        <div
          ref="horizon"
          class="chat__horizon"
        />
      </div>

      <!-- "Scroll to bottom" button -->
      <button
        v-show="!isAtBottom && isReady"
        class="chat__scrollToBottom"
        @click="scrollToBottom"
      >
        {{ $t('chat.scrollToBottom') }}
      </button>
    </div>

    <!-- Chat width resizer -->
    <div
      v-if="isHorizontalLayoutType && !isChatHidden"
      class="chat__resizer chat__resizer--for-horizontal"
      @mousedown="resize($event, Axis.X)"
    />

    <!-- Chat height resizer -->
    <div
      v-if="!isHorizontalLayoutType"
      class="chat__resizer chat__resizer--for-vertical"
      @mousedown="resize($event, Axis.Y)"
    />

    <div class="chat__form">
      <chat-form
        :channel-name="channelName"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ChatForm from '@/src/components/chat/Form.vue';
import * as actions from '@/src/store/actions';
import Resizer, { Axis } from '@/src/utils/resizer';
import Scroller from '@/src/utils/scroller';
import { PlayerLayout } from '@/types/renderer/player';
import type { ChatMessage } from '@/types/renderer/chat';

/**
 * Chat width limits
 */
enum ChatWidth {
  Min = 100,
  Max = 1000,
}

/**
 * Chat height limits
 */
 enum ChatHeight {
  Min = 100,
  Max = 1000,
}

export default defineComponent({
  name: 'Chat',
  components: {
    ChatForm,
  },
  props: {
    /**
     * Channel name
     */
    channelName: {
      type: String,
      default: '',
    },

    /**
     * Channel id
     */
    channelId: {
      type: String,
      default: '',
    },
  },
  data (): {
    Axis: typeof Axis;
    horizonObserver: IntersectionObserver | null;
    customChatWidth: number;
    customChatHeight: number;
    isAtBottom: boolean;
    resizer: {
      [Axis.X]: Resizer | null;
      [Axis.Y]: Resizer | null;
    };
    scroller: Scroller | null;
    isReady: boolean;
    } {
    return {
      /**
       * Available axises for resize
       */
      Axis,

      /**
       * Chat width in horizontal layout.
       * Can be changed by user
       */
      customChatWidth: this.$store.state.chat.width,

      /**
       * Chat height in vertical layout.
       * Can be changed by user
       */
      customChatHeight: this.$store.state.chat.height,

      /**
       * Messages horizon observer instance
       */
      horizonObserver: null,

      /**
       * True, if messages list is scrolled to bottom
       */
      isAtBottom: false,

      /**
       * Resizer instances
       */
      resizer: {
        [Axis.X]: null,
        [Axis.Y]: null,
      },

      /**
       * Scroller instance
       */
      scroller: null,

      /**
       * True, if chat is ready to display messages for current channel.
       * Used to prevent displaying messages from previous channel
       */
      isReady: false,
    };
  },
  computed: {
    /**
     * Logined user id
     */
    userId (): string | null {
      return this.$store.state.user.id;
    },

    /**
     * Logined user name
     */
    userName (): string | null {
      return this.$store.state.user.name;
    },

    /**
     * Chat messages
     */
    messages (): ChatMessage[] {
      return this.isReady ? this.$store.state.chat.messages : [];
    },

    /**
     * Last message
     */
    lastMessage (): ChatMessage {
      return this.$store.state.chat.messages.slice(-1)[0];
    },

    /**
     * Returns true, if current player layout is horizontal
     */
    isHorizontalLayoutType (): boolean {
      return this.$store.state.player.layout === PlayerLayout.Horizontal;
    },

    /**
     * True, if chat is hidden
     */
    isChatHidden (): boolean {
      return this.$store.state.player.isHideChat;
    },

    /**
     * Returns true, if chat is paused
     */
    isPaused (): boolean {
      return this.$store.state.chat.isPaused;
    },

    /**
     * Chat CSS width, based on current layout type
     */
    chatWidth (): string {
      return this.isHorizontalLayoutType ? `${this.customChatWidth}px` : 'auto';
    },

    /**
     * Chat CSS height, based on current layout type
     */
    chatHeight (): string {
      return !this.isHorizontalLayoutType ? `${this.customChatHeight}px` : 'auto';
    },
  },
  watch: {
    /**
     * If chat is not paused, autoscroll messages list to bottom
     */
    lastMessage (): void {
      if (!this.isPaused) {
        this.scrollToBottom();
      }
    },
  },
  mounted () {
    /** Join IRC */
    this.$store.dispatch(actions.JOIN_CHANNEL_CHAT, {
      channelName: this.channelName,
      channelId: this.channelId,
      userId: this.userId,
    }).then(() => {
      this.isReady = true;
    });

    /** Request chat emotes */
    this.$store.dispatch(actions.REQUEST_CHAT_EMOTES, {
      channelName: this.channelName,
      channelId: this.channelId,
    });

    /** Start watching for horizon interesections */
    this.horizonObserver = new IntersectionObserver(this.onHorizonIntersection, {
      root: this.$refs.scrollable as HTMLElement,
      threshold: 1,
      rootMargin: '0px 0px 100px 0px',
    });

    this.horizonObserver.observe(this.$refs.horizon as HTMLElement);

    /** Enable resizers */
    this.resizer[Axis.X] = new Resizer({
      axis: Axis.X,
      value: this.customChatWidth,
      limit: {
        min: ChatWidth.Min,
        max: ChatWidth.Max,
      },
      onResize: (value) => {
        this.customChatWidth = value;
      },
      onStop: () => {
        this.$store.dispatch(actions.SET_CHAT_WIDTH, this.customChatWidth);
      },
    });

    this.resizer[Axis.Y] = new Resizer({
      axis: Axis.Y,
      value: this.customChatHeight,
      limit: {
        min: ChatHeight.Min,
        max: ChatHeight.Max,
      },
      onResize: (value) => {
        this.customChatHeight = value;
      },
      onStop: () => {
        this.$store.dispatch(actions.SET_CHAT_HEIGHT, this.customChatHeight);
      },
    });

    /** Listen for scroll */
    this.scroller = new Scroller(this.$refs.scrollable as HTMLElement);
  },
  beforeUnmount () {
    this.isReady = false;

    /** Leave IRC */
    this.$store.dispatch(actions.LEAVE_CHANNEL_CHAT, {
      channelName: this.channelName,
      channelId: this.channelId,
      userId: this.userId,
    });

    /** CLear chat messages */
    this.$store.dispatch(actions.CLEAR_CHAT);

    /** Stop watching for intersections */
    if (this.horizonObserver) {
      this.horizonObserver.unobserve(this.$refs.horizon as HTMLElement);
      this.horizonObserver = null;
    }

    /** Disable resizers */
    Object.entries(this.resizer).forEach(([axis, instance]) => {
      if (instance) {
        instance.destroy();
      }

      this.resizer[axis as Axis] = null;
    });

    /** Stop listening for scroll */
    if (this.scroller) {
      this.scroller.destroy();
      this.scroller = null;
    }
  },
  methods: {
    /**
     * Returns styles for chat message
     */
    getChatMessageStyles (message: ChatMessage): Record<string, string> {
      const { color, text } = message;

      return {
        ['--color' as string]: color,
        ['--text-color' as string]: text.isColored ? color : '',
      };
    },

    /**
     * Pause or unpause chat autoscroll
     */
    setChatPause (value: boolean): void {
      this.$store.dispatch(actions.SET_CHAT_PAUSE, value);
    },

    /**
     * Scroll to chat bottom, using horizon
     */
    scrollToBottom (): void {
      window.requestAnimationFrame(() => {
        const horizonElement = this.$refs.horizon as HTMLElement;

        if (horizonElement) {
          horizonElement.scrollIntoView({
            block: 'start',
          });
        }
      });
    },

    /**
     * Update isAtBottom state on horizon intersections
     */
    onHorizonIntersection (entries: IntersectionObserverEntry[]): void {
      entries.forEach((entry: IntersectionObserverEntry) => {
        this.isAtBottom = entry.intersectionRatio > 0;
      });
    },

    /**
     * Resize chat horizontally or vertically
     */
    resize (event: MouseEvent, axis: Axis): void {
      const resizer = this.resizer[axis];

      if (!resizer) {
        return;
      }

      resizer.start(axis === Axis.Y ? event.clientY : event.clientX);
    },
  },
});
</script>

<style>
  .chat {
    --list-offset: 1rem;
    --item-offset-x: 1rem;
    --item-offset-y: 0.7rem;

    min-height: 0;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  .chat--hidden {
    max-width: 0;
  }

  .chat__content {
    height: 100%;
  }

  .chat__horizon {
    width: 100%;
    height: 0;
  }

  .chat__dummy {
    width: 100%;
    padding: 0.75rem var(--offset-window) 0.75rem 1.5rem;
    color: var(--color-text-secondary);
    text-align: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  /** Resizer */
  .chat__resizer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .chat__resizer--for-horizontal {
    width: 5px;
    height: 100%;
    cursor: ew-resize;
  }

  .chat__resizer--for-vertical {
    width: 100%;
    height: 5px;
    cursor: ns-resize;
  }

  /** Scroll to bottom */
  .chat__scrollToBottom {
    position: sticky;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .chat__scrollToBottom::after {
    content: '';
    width: 0.6rem;
    height: 0.6rem;
    border-style: solid;
    border-width: 0 0.15rem 0.15rem 0;
    margin-top: -0.1rem;
    margin-left: 1.2rem;
    transform: rotate(45deg);
  }

  .chat__scrollToBottom:active {
    transform: translateX(-50%) translateY(1px);
  }

  .chat__messages {
    padding-left: var(--list-offset);
    padding-bottom: var(--list-offset);
  }

  /** Message */
  .chat-message {
    padding: var(--item-offset-y) var(--item-offset-x);
    user-select: text;
    overflow-wrap: break-word;
    color: var(--text-color);
    border-radius: var(--border-radius);
  }

  .chat-message:nth-child(2n) {
    background-color: var(--color-control-semiactive);
  }

  .chat-message--removed {
    opacity: 0.2;
  }

  .chat-message__author {
    font-weight: 500;
    color: var(--color, var(--color-text));
    border-radius: var(--border-radius);
    padding-right: 0.1rem;
  }

  .chat-message__content .emote {
    display: inline-block;
    vertical-align: middle;
    margin-top: -0.1rem;
  }

  .chat-message__content a {
    color: var(--color-link);
    pointer-events: auto;
  }

  .chat-message__content a:hover {
    color: inherit;
  }

  .chat-message__content .emote img {
    height: calc(var(--height, 32px) *( var(--size-base) / 10));
  }

  /** Allow some unique emotes to overlap others */
  .chat-message__content .emote + .emote[title="cvMask"],
  .chat-message__content .emote + .emote[title="cvHazmat"] {
    margin-left: -32px;
  }

  .chat-message__badges {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    margin-right: 0.6rem;
    margin-top: -1px;
  }

  /** Form wrapper */
  .chat__form {
    padding: 0 var(--list-offset) var(--list-offset);
    min-width: 0;
  }

  /** Author badges */
  .badge {
    --size: 0.8rem;

    flex-shrink: 0;
    width: var(--size);
    height: var(--size);
    background-color: rgba(var(--rgb-badge), 0.9);
    border-radius: 50%;
  }

  .badge:not(:last-child) {
    margin-right: 0.6rem;
  }

  .badge--moderator {
    --rgb-badge: 0, 177, 106;
  }

  .badge--subscriber {
    --rgb-badge: 245, 171, 53;
  }

  .badge--partner {
    --rgb-badge: 155, 89, 182;
  }

  .badge--broadcaster {
    --rgb-badge: 192, 57, 43;
  }
</style>
