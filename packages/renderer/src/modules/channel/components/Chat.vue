<template>
  <div
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
      @mouseenter="pauseChat(true)"
      @mouseleave="pauseChat(false)"
    >
      <div class="chat__messages">
        <!-- Empty chat message -->
        <div
          v-if="!messages.length && userName"
          class="chat__dummy"
        >
          <template v-if="isJoined">
            {{ t('chat.joinedAs', {
              name: userName,
              channel: joinedChannel,
            }) }}
          </template>

          <template v-else>
            {{ t('chat.connectingTo', {
              channel: joinedChannel,
            }) }}
          </template>
        </div>

        <!-- Messages list -->
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'chat-message',
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
            {{ message.author }}{{ message.isColoredText ? ' ' : ': ' }}
          </span>

          <!-- Message text -->
          <span
            class="chat-message__content"
            v-html="message.text"
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
        v-show="!isAtBottom && isJoined"
        class="chat__scrollToBottom"
        @click="scrollToBottom"
      >
        {{ t('chat.scrollToBottom') }}
      </button>
    </div>

    <div class="chat__form">
      <Form />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChat } from '../useChat';
import { usePlayer } from '../usePlayer';
import Form from './chat/Form.vue';
import type { ChatMessage } from '@/src/modules/channel/types/chat';
import Resizer, { Axis } from '@/src/utils/resizer';
import Scroller from '@/src/utils/scroller';
import { PlayerLayout } from '@/src/modules/channel/types/player';
import { useUser } from '@/src/modules/auth/useUser';

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

const props = withDefaults(defineProps<{
  /** Channel name */
  channelName: string;

  /** Channel id */
  channelId: string;
}>(), {
  channelName: '',
  channelId: '',
});

const { t } = useI18n();
const { state: userState } = useUser();
const { state: playerState } = usePlayer();
const {
  state: chatState,
  messages: chatMessages,
  join: joinChat,
  leave: leaveChat,
  clear: clearChat,
  pause: pauseChat,
  isPaused,
  isJoined,
  joinedChannel,
} = useChat();

/**
 * Messages horizon observer instance
 */
const horizonObserver = ref<IntersectionObserver>();

/**
 * Chat width in horizontal layout.
 * Can be changed by user
 */
const customChatWidth = ref(chatState.width);

/**
 * Chat height in vertical layout.
 * Can be changed by user
 */
const customChatHeight = ref(chatState.height);

/**
 * True, if messages list is scrolled to bottom
 */
const isAtBottom = ref(false);

/** Resizer instances */
const resizer = reactive<{
  [Axis.X]?: Resizer;
  [Axis.Y]?: Resizer;
}>({
  [Axis.X]: undefined,
  [Axis.Y]: undefined,
});

/** Scroller instance */
const scroller = ref<Scroller>();

/** Scrollable container element */
const scrollable = ref<HTMLElement>();

/** Container horizon element */
const horizon = ref<HTMLElement>();

/** Logined user name */
const userName = computed(() => userState.name);

/**
 * @todo Move some computed properties to composables
 */

/** Chat messages */
const messages = computed(() => isJoined.value ? chatMessages.value : []);

/** Last message */
const lastMessage = computed(() => chatMessages.value.slice(-1)[0]);

/** Returns true, if current player layout is horizontal */
const isHorizontalLayoutType = computed(() => playerState.layout === PlayerLayout.Horizontal);

/** True, if chat is hidden */
const isChatHidden = computed(() => playerState.isHideChat);

/** Chat CSS width, based on current layout type */
const chatWidth = computed(() => isHorizontalLayoutType.value ? `${customChatWidth.value}px` : 'auto');

/** Chat CSS height, based on current layout type */
const chatHeight = computed(() => !isHorizontalLayoutType.value ? `${customChatHeight.value}px` : 'auto');

/** If chat is not paused, autoscroll messages list to bottom */
watch(lastMessage, () => {
  if (!isPaused.value) {
    scrollToBottom();
  }
});

onMounted(() => {
  /** Join chat room */
  joinChat({
    channelId: props.channelId,
    channelName: props.channelName,
  });

  /** Start watching for horizon interesections */
  /**
   * @todo Use composable
   */
  horizonObserver.value = new IntersectionObserver(onHorizonIntersection, {
    root: scrollable.value,
    threshold: 1,
    rootMargin: '0px 0px 100px 0px',
  });

  if (horizon.value) {
    horizonObserver.value.observe(horizon.value);
  }

  /** Enable resizers */
  /**
   * @todo Make composable for resizers
   */
  resizer[Axis.X] = new Resizer({
    axis: Axis.X,
    value: customChatWidth.value,
    limit: {
      min: ChatWidth.Min,
      max: ChatWidth.Max,
    },
    onResize: (value) => {
      customChatWidth.value = value;
    },
    onStop: () => {
      chatState.width = customChatWidth.value;
    },
  });

  resizer[Axis.Y] = new Resizer({
    axis: Axis.Y,
    value: customChatHeight.value,
    limit: {
      min: ChatHeight.Min,
      max: ChatHeight.Max,
    },
    onResize: (value) => {
      customChatHeight.value = value;
    },
    onStop: () => {
      chatState.height = customChatHeight.value;
    },
  });

  /** Listen for scroll */
  /**
   * @todo Move scroller to composable
   */
  if (scrollable.value) {
    scroller.value = new Scroller(scrollable.value);
  }
});

onBeforeUnmount(() => {
  /** Leave chat room */
  leaveChat(props.channelName);

  /** CLear chat messages */
  clearChat();

  /** Stop watching for intersections */
  if (horizonObserver.value) {
    horizonObserver.value.disconnect();
    horizonObserver.value = undefined;
  }

  /** Disable resizers */
  Object.entries(resizer).forEach(([axis, instance]) => {
    if (instance) {
      instance.destroy();
    }

    resizer[axis as Axis] = undefined;
  });

  /** Stop listening for scroll */
  scroller.value?.destroy();
  scroller.value = undefined;
});

/**
 * Returns styles for chat message
 */
function getChatMessageStyles (message: ChatMessage): Record<string, string> {
  const { color, isColoredText } = message;

  return {
    '--color': color,
    '--text-color': isColoredText ? color : '',
  };
}

/**
 * Scroll to chat bottom, using horizon
 */
function scrollToBottom (): void {
  window.requestAnimationFrame(() => {
    horizon.value?.scrollIntoView({
      block: 'start',
    });
  });
}

/**
 * Update isAtBottom state on horizon intersections
 */
function onHorizonIntersection (entries: IntersectionObserverEntry[]): void {
  entries.forEach((entry: IntersectionObserverEntry) => {
    isAtBottom.value = entry.intersectionRatio > 0;
  });
}

/**
 * Resize chat horizontally or vertically
 */
function resize (event: MouseEvent, axis: Axis): void {
  resizer[axis]?.start(axis === Axis.Y ? event.clientY : event.clientX);
}
</script>

<style lang="postcss">
  .chat {
    min-height: 0;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;

    &--hidden {
      max-width: 0;
    }

    &__horizon {
      width: 100%;
      height: 0;
    }

    &__dummy {
      width: 100%;
      padding: 0.75rem var(--offset-window) 0.75rem 1.5rem;
      color: var(--color-text-secondary);
      text-align: center;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    &__resizer {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;

      &--for-horizontal {
        width: 5px;
        height: 100%;
        cursor: ew-resize;
      }

      &--for-vertical {
        width: 100%;
        height: 5px;
        cursor: ns-resize;
      }
    }

    &__scrollToBottom {
      position: sticky;
      bottom: 2.5rem;
      left: 50%;
      transform: translateX(-50%);

      &::after {
        content: '';
        width: 0.6rem;
        height: 0.6rem;
        border-style: solid;
        border-width: 0 0.15rem 0.15rem 0;
        margin-top: -0.1rem;
        margin-left: 1.2rem;
        transform: rotate(45deg);
      }

      &:active {
        transform: translateX(-50%) translateY(1px);
      }
    }

    &__messages {
      padding-left: var(--width-scrollbar);
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: var(--width-scrollbar);
    }
  }

  /** Message */
  .chat-message {
    --offset-x: 1rem;
    --offset-y: 0.7rem;

    padding: var(--offset-y) var(--offset-x);
    user-select: text;
    overflow-wrap: break-word;
    color: var(--text-color);
    border-radius: var(--border-radius);

    &:nth-child(2n):not(.chat-message--mention) {
      background-color: var(--color-control-semiactive);
    }

    &--removed {
      opacity: 0.2;
    }

    &__author {
      font-weight: 500;
      color: var(--color, var(--color-text));
      border-radius: var(--border-radius);
      padding-right: 0.1rem;
    }

    &__content {
      .emote {
        display: inline-block;
        vertical-align: middle;
        margin-top: -0.1rem;

        &--zero-width {
          display: inline-flex;
          justify-content: flex-end;
          position: relative;
          z-index: 1;
          width: 0;

          &:first-child {
            justify-content: flex-start;
          }
        }

        img {
          max-height: calc(var(--height, 28px) * ( var(--size-base) / 10));
        }
      }

      a {
        color: var(--color-link);
        pointer-events: auto;

        &:hover {
          color: inherit;
        }
      }
    }

    &__badges {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      margin-right: 0.6rem;
      margin-top: -1px;
    }
  }

  .mention {
    font-weight: 500;
    background-color: var(--color-control-active);
    color: var(--color-link);
    padding: 0.2rem 0.4rem;
    border-radius: var(--border-radius);
  }

  /** Author badges */
  .badge {
    --size: 0.8rem;

    flex-shrink: 0;
    width: var(--size);
    height: var(--size);
    background-color: rgba(var(--rgb-badge), 0.9);
    border-radius: 50%;

    &:not(:last-child) {
      margin-right: 0.6rem;
    }

    &--moderator {
      --rgb-badge: 0, 177, 106;
    }

    &--subscriber {
      --rgb-badge: 245, 171, 53;
    }

    &--partner {
      --rgb-badge: 155, 89, 182;
    }

    &--broadcaster {
      --rgb-badge: 192, 57, 43;
    }
  }
</style>
