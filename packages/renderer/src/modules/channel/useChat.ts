import { ref, reactive } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import linkifyHtml from 'linkify-html';
import { useEmotes } from './useEmotes';
import { getEmoteHtml } from './utils/emotes';
import type { ChatStoreSchema, ChatMessage, ChatUserState, ChatServiceMessage } from './types/chat';
import { escape, uid } from '@/src/utils/utils';
import { useStore } from '@/src/infrastructure/store/useStore';
import { useIrc } from '@/src/infrastructure/irc/useIrc';
import { IrcCommand } from '@/src/infrastructure/irc/types';
import { getColorForChatAuthor } from '@/src/utils/color';

/**
 * Max number of messages in chat
 */
const LIMIT = 200;

/**
 * @todo When processing pending message, deal with /me part of a text instead
 */
const COLORED_MESSAGE_START_MARKER = '\u{1}ACTION';

const COLORED_MESSAGE_END_MARKER = '\u{1}';

const defaultChatState: ChatStoreSchema = {
  width: 300,
  height: 500,
};

export const useChat = createSharedComposable(() => {
  const { state } = useStore('chat', defaultChatState);
  const { emotes, getChannelEmotes } = useEmotes();
  const {
    join: joinChannel,
    leave: leaveChannel,
    send: sendMessage,
    onServiceMessageReceived,
    offServiceMessageReceived,
    onUserStateUpdated,
    offUserStateUpdated,
    onMessageReceived,
    offMessageReceived,
  } = useIrc();

  const joinedChannel = ref<string>();
  const userState = ref<ChatUserState>();

  const messages = ref<ChatMessage[]>([]);
  const pendingUserMessages = reactive(new Map<string, string>());

  const isPaused = ref(false);
  const isJoined = ref(false);

  /**
   * Perform actions, when service message is received
   */
  function serviceMessagesHandler ({ command }: ChatServiceMessage): void {
    if (command === IrcCommand.Join) {
      isJoined.value = true;
      clear();
    } else if (command === IrcCommand.Leave) {
      isJoined.value = false;
    }
  }

  /**
   * User's state is updated, when
   * - connecting to IRC. We receive state in global context;
   * - joining a room. We receive state in room context;
   * - sending a message. We receive state of sent message;
   */
  function userStateUpdatesHandler (state: ChatUserState): void {
    /**
     * Update local state
     */
    userState.value = state;

    /**
     * If client nonce is received, it means that
     * user's state update is a response to some user's action.
     * Assume it is a response to a sent message and try to process pending one with same nonce value
     */
    if (state.nonce !== undefined) {
      processPendingMessage(state.nonce);
    }
  }

  /**
   * Perform actions, when chat message is received
   */
  function messagesHandler (message: ChatMessage): void {
    addMessage(message);
  }

  async function join ({ channelId, channelName }: { channelId: string; channelName: string }): Promise<void> {
    joinChannel(channelName);

    void getChannelEmotes(channelName, channelId);

    onServiceMessageReceived(serviceMessagesHandler);
    onUserStateUpdated(userStateUpdatesHandler);
    onMessageReceived(messagesHandler);

    joinedChannel.value = channelName;
  }

  function leave (channel: string): void {
    clear();

    leaveChannel(channel);
    offServiceMessageReceived(serviceMessagesHandler);
    offUserStateUpdated(userStateUpdatesHandler);
    offMessageReceived(messagesHandler);

    joinedChannel.value = undefined;
  }

  function send (text: string, channelName: string): void {
    const nonce = uid();

    pendingUserMessages.set(nonce, text);

    sendMessage(text, channelName, nonce);
  }

  /**
   * Try to find and process pending message with specified nonce value
   */
  function processPendingMessage (nonce: string): void {
    const pendingMessageText = pendingUserMessages.get(nonce);

    /**
     * Do not proceed, if local user's state is missing
     * or pending message is not found
     */
    if (userState.value === undefined || pendingMessageText === undefined) {
      return;
    }

    const { messageId, name, color, badges } = userState.value;

    /**
     * Do not proceed, if user's state is missing data,
     * required for displaying a message
     */
    if (messageId === undefined || name === undefined || color === undefined || badges === undefined) {
      return;
    }

    /**
     * Add message to chat
     */
    addMessage({
      id: messageId,
      author: name,
      text: pendingMessageText,
      color,
      badges,
    });

    /**
     * Remove message from pending list
     */
    pendingUserMessages.delete(nonce);
  }

  /**
   * Returns HTML of a message, ready for display.
   * Escape unsafe symbols, highlight links and replace text parts with supported emotes
   */
  function parseMessageText (source: string, isColoredText = false): { html: string; emotes: string[] } {
    if (isColoredText) {
      source = source
        .replace(COLORED_MESSAGE_START_MARKER, '')
        .replace(COLORED_MESSAGE_END_MARKER, '');
    }

    source = linkifyHtml(escape(source), {
      className: 'link',
      defaultProtocol: 'https',
      target: '_self',
    });

    const emotesNames: string[] = [];

    const html = source
      .split(' ')
      .map((word: string) => {
        if (emotes.value[word] !== undefined) {
          /**
           * Do not push emote name, if it has been already added.
           * Means that multiple emote's spam in one message will not affect emote's hotness
           */
          if (!emotesNames.includes(word)) {
            emotesNames.push(word);
          }

          return getEmoteHtml(word, emotes.value[word].urls);
        }

        return word;
      }).join(' ');

    return {
      html,
      emotes: emotesNames,
    };
  }

  /**
   * Add message to displayed list
   * @todo Make message object reactive
   */
  function addMessage (message: ChatMessage): void {
    const isColoredText = message.text.startsWith(COLORED_MESSAGE_START_MARKER) && message.text.endsWith(COLORED_MESSAGE_END_MARKER);
    const parsedText = parseMessageText(message.text, isColoredText);

    messages.value.push({
      ...message,
      isColoredText,
      color: getColorForChatAuthor(message.color),
      text: parsedText.html,
      emotes: parsedText.emotes,
    });

    if (messages.value.length > LIMIT && !isPaused.value) {
      messages.value.splice(0, messages.value.length - LIMIT);
    }
  }

  /**
   * Clear displayed list
   */
  function clear (): void {
    messages.value = [];
  }

  /**
   * Pause or unpause chat autoscroll
   */
  function pause (value: boolean): void {
    isPaused.value = value;
  }

  /**
   * Returns emotes names from the last N chat messages
   */
  function getMessagesEmotesNames (offset = 100): string[] {
    return messages.value.slice(offset * -1).reduce<string[]>((result, message) => {
      if (message.emotes !== undefined) {
        result.push(...message.emotes);
      }

      return result;
    }, []);
  }

  return {
    state,
    messages,
    join,
    leave,
    clear,
    send,
    pause,
    isPaused,
    isJoined,
    joinedChannel,
    getMessagesEmotesNames,
  };
});
