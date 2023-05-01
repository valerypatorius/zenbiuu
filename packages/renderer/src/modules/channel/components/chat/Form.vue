<template>
  <Emotes
    v-if="isEmotesActive"
    @select="onEmoteSelect"
  />

  <div
    :class="[
      'chat-form',
      isEmpty && 'chat-form--empty',
    ]"
  >
    <div
      ref="fieldElement"
      :class="[
        'scrollable',
        'chat-form__field',
        isEmpty && 'chat-form__field--empty',
      ]"
      v-bind="fieldProps"
      tabindex="0"
      :data-placeholder="t('chat.message')"
      @input="onInput()"
      @paste="onPaste"
      @drop.prevent
      @keydown.ctrl.enter="submit"
    />

    <div
      v-show="messageLength > ACKNOWLEDGED_MESSAGE_LENGTH"
      :class="[
        'chat-form__counter',
        isLimitExceeded && 'chat-form__counter--exceeded'
      ]"
    >
      {{ MAX_MESSAGE_LENGTH - messageLength }}
    </div>

    <div class="chat-form__actions">
      <!-- <div
        :class="[
          'chat-form__button',
          isEmotesActive && 'chat-form__button--active',
        ]"
        @click="toggleEmotesSelection"
      >
        <Icon name="Emote" />
      </div> -->

      <div
        :class="[
          'chat-form__button',
          isEmpty && 'chat-form__button--disabled',
        ]"
        @click="submit"
      >
        <Icon :name="'ArrowUp'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, HTMLAttributes } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChat } from '../../useChat';
import { useEmotes } from '../../useEmotes';
import { getEmoteImage } from '../../utils/emotes';
import { ChatEmote } from '../../types/chat';
import { getPlainTextFromHtml } from '../../utils/form';
import Emotes from './Emotes.vue';
import { useCursor } from '@/src/modules/ui/useCursor';
import Icon from '@/src/modules/ui/components/Icon.vue';

const { t } = useI18n();
const { send, isJoined, joinedChannel, getMessagesEmotesNames } = useChat();
const { setHotEmotes, addRecentEmote } = useEmotes();

const MAX_MESSAGE_LENGTH = 500;

const ACKNOWLEDGED_MESSAGE_LENGTH = 400;

const fieldElement = ref<HTMLElement>();

const isEmotesActive = ref(false);

const message = ref('');

const messageLength = computed(() => message.value.length);

const isLimitExceeded = computed(() => MAX_MESSAGE_LENGTH - messageLength.value < 0);

const isEmpty = computed(() => message.value.length === 0);

const fieldProps: HTMLAttributes = {
  // @ts-ignore
  contenteditable: 'plaintext-only',
};

function onInput (isClearEmpty = true): void {
  if (fieldElement.value === undefined) {
    return;
  }

  /**
   * @todo Replace matching emotes on the fly, using range
   */

  message.value = getPlainTextFromHtml(fieldElement.value);

  /**
   * Clear all html garbage, if message is in fact empty
   */
  if (isEmpty.value && isClearEmpty) {
    clear();
  }
}

function onPaste (event: ClipboardEvent): void {
  event.preventDefault();

  const clipboardText = event.clipboardData?.getData('text/plain');

  document.execCommand('insertText', false, clipboardText);
}

function clear (): void {
  message.value = '';

  if (fieldElement.value !== undefined) {
    fieldElement.value.innerHTML = '';
  }
}

function submit (): void {
  if (isEmpty.value || !isJoined.value || joinedChannel.value === undefined) {
    return;
  }

  send(message.value, joinedChannel.value);
  clear();
}

function toggleEmotesSelection (): void {
  isEmotesActive.value = !isEmotesActive.value;

  /**
   * Each time emote selection becomes active, we get emotes
   * from last messages in chat and provide them for selection.
   *
   * First, we don't need to store them in constantly updated reactive object, when selection is not active.
   * Second, we don't need hot emotes to be updated when selection is active
   */
  if (isEmotesActive.value) {
    setHotEmotes(getMessagesEmotesNames());
  } else {
    setHotEmotes(undefined);
  }
}

const { appendNodeAtCursor } = useCursor(fieldElement);

function onEmoteSelect (emote: ChatEmote, isRememberRecent: boolean): void {
  if (isRememberRecent && joinedChannel.value !== undefined) {
    addRecentEmote(emote.name);
  }

  const node = getEmoteImage(emote.name, emote.urls);

  appendNodeAtCursor(node);

  onInput(false);
}
</script>

<style lang="postcss">
.chat-form {
  --icon-size: 2rem;
  --min-field-size: 4rem;
  min-width: 0;
  position: relative;
  display: grid;

  &__field {
    min-height: var(--min-field-size);
    padding: var(--width-scrollbar);
    padding-right: calc(var(--min-field-size) * 2);
    max-height: 20rem;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--color-overlay);
    border-radius: var(--border-radius);

    &:focus {
      background-color: var(--color-overlay-full);
    }

    &--empty {
      &::before {
        content: attr(data-placeholder);
        color: var(--color-text-secondary);
        pointer-events: none;
        font-weight: 500;
      }
    }

    img {
      display: inline-block;
      vertical-align: middle;
      margin-top: -0.1rem;
    }
  }

  &__actions {
    display: flex;
    align-items: end;
    position: absolute;
    right: 0;
    bottom: 0;
  }

  &__button {
    flex-shrink: 0;
    width: var(--min-field-size);
    height: var(--min-field-size);
    cursor: pointer;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover,
    &--active {
      color: var(--color-text-main);
    }

    &--disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    .icon {
      width: var(--icon-size);
    }
  }

  &__counter {
    font-size: 1.2rem;
    line-height: 1em;
    color: var(--color-text-tertiary);
    position: absolute;
    top: var(--width-scrollbar);
    right: var(--width-scrollbar);
    pointer-events: none;

    &--exceeded {
      color: var(--color-error);
    }
  }
}
</style>
