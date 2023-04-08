<template>
  <div
    :class="[
      'chat-form-container',
      isEmpty && 'chat-form-container--empty',
    ]"
  >
    <keep-alive>
      <Emotes
        v-if="isEmotesActive"
        @select="onEmoteSelect"
      />
    </keep-alive>

    <div class="chat-form">
      <div
        ref="fieldElement"
        :class="[
          'scrollable',
          'chat-form__field',
          isEmpty && 'chat-form__field--empty',
        ]"
        tabindex="0"
        contenteditable="true"
        :data-placeholder="t('chat.message')"
        @input="onInput"
        @paste="onPaste"
        @drop.prevent
        @keydown.ctrl.enter="submit"
      />

      <div
        :class="[
          'chat-form__emote-button',
          isEmotesActive && 'chat-form__emote-button--active',
        ]"
        @click="toggleEmotesSelection"
      >
        <Icon name="Emote" />
      </div>

      <div
        v-show="messageLength > ACKNOWLEDGED_MESSAGE_LENGTH"
        :class="[
          'chat-form__counter',
          isLimitExceeded && 'chat-form__counter--exceeded'
        ]"
      >
        {{ MAX_MESSAGE_LENGTH - messageLength }}
      </div>
    </div>

    <div
      v-show="!isEmpty"
      class="chat-submit"
      @click="submit"
    >
      <Icon :name="'ArrowUp'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChat } from '../../useChat';
import { useEmotes } from '../../useEmotes';
import Emotes from './Emotes.vue';
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

function onInput (): void {
  message.value = fieldElement.value?.innerText.trim() ?? '';

  /**
   * Clear all html garbage, if message is in fact empty
   */
  if (isEmpty.value && fieldElement.value !== undefined) {
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

function onEmoteSelect (name: string): void {
  addRecentEmote(name);
}
</script>

<style lang="postcss">
.chat-form-container {
  --icon-size: 2rem;
  --min-field-size: 4rem;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 1rem;
  position: relative;

  &--empty {
    grid-template-columns: 1fr;
  }
}

.chat-form {
  min-width: 0;
  position: relative;

  &__field {
    min-height: var(--min-field-size);
    padding: var(--width-scrollbar);
    padding-right: var(--min-field-size);
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
  }

  &__emote-button {
    width: var(--min-field-size);
    height: var(--min-field-size);
    position: absolute;
    bottom: 0;
    right: 0;
    cursor: pointer;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover,
    &--active {
      color: var(--color-text-main);
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

.chat-submit {
  width: var(--min-field-size);
  height: var(--min-field-size);
  color: var(--color-text-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: var(--color-control-semiactive);
  }

  .icon {
    width: var(--icon-size);
  }
}
</style>
