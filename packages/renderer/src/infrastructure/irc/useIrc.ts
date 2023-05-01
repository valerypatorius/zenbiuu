import { watch, ref } from 'vue';
import { createEventHook, createSharedComposable, useWebWorker, useDebounceFn, useCounter } from '@vueuse/core';
import IrcWorker from './irc.worker.ts?worker';
import { IrcAction, IrcCloseCode, IrcCommand, type ParsedIrcMessage, type IrcData, type IrcPayload } from './types';
import type { ChatMessage, ChatServiceMessage, ChatUserState } from '@/src/modules/channel/types/chat';
import { parseMessage } from '@/src/utils/irc';
import log from '@/src/utils/log';
import { useUser } from '@/src/modules/auth/useUser';

const IrcEndpoint = 'wss://irc-ws.chat.twitch.tv:443';

export const useIrc = createSharedComposable(() => {
  const worker = new IrcWorker();

  const { data: workerData, post: postMessage } = useWebWorker<IrcData>(worker);
  const { state: userState } = useUser();
  const { count: connectionDelay, set: setConnectionDelay, reset: resetConnectionDelay } = useCounter(100);

  const isConnected = ref(false);

  const hooks = {
    messageReceived: createEventHook<ChatMessage>(),
    userStateUpdate: createEventHook<ChatUserState>(),
    serviceMessageReceived: createEventHook<ChatServiceMessage>(),
  };

  watch(workerData, () => {
    /**
     * If received data is a string, assume it is an IRC message,
     * so parse it
     */
    if (typeof workerData.value === 'string') {
      handleWorkerMessage(workerData.value);

      return;
    }

    /**
     * If close marker was not provided, do not proceed just in case
     */
    if (workerData.value.close !== true) {
      return;
    }

    log.warning(log.Type.Irc, 'Closed');

    isConnected.value = false;

    const isReconnect = workerData.value.code !== IrcCloseCode.Manual;

    /**
     * If connection is lost, but user token is present, try to reconnect
     */
    if (isReconnect && userState.token !== undefined) {
      log.message(log.Type.Irc, 'Reconnecting');

      void connect();
    }
  });

  /**
   * Debounced connect call for manual use.
   * Helps to avoid frequent calls when trying to reconnect
   */
  const connect = useDebounceFn(() => {
    if (isConnected.value) {
      return;
    }

    const data: IrcPayload = {
      url: IrcEndpoint,
      token: userState.token,
      name: userState.name,
    };

    postMessage({
      action: IrcAction.Connect,
      data,
    });

    setConnectionDelay(connectionDelay.value * 2);
  }, connectionDelay);

  /**
   * Disconnect call for manual use
   */
  function disconnect (): void {
    if (!isConnected.value) {
      return;
    }

    const data: IrcPayload = {
      code: IrcCloseCode.Manual,
    };

    postMessage({
      action: IrcAction.Disconnect,
      data,
    });
  }

  function join (channel: string): void {
    const data: IrcPayload = {
      channel,
    };

    postMessage({
      action: IrcAction.Join,
      data,
    });
  }

  function leave (channel: string): void {
    const data: IrcPayload = {
      channel,
    };

    postMessage({
      action: IrcAction.Leave,
      data,
    });
  }

  function send (message: string, channel: string, nonce: string): void {
    const data: IrcPayload = {
      message,
      channel,
      nonce,
    };

    postMessage({
      action: IrcAction.Send,
      data,
    });
  }

  function handleConnection (): void {
    resetConnectionDelay();

    isConnected.value = true;

    postMessage({
      action: IrcAction.RunQueue,
    });
  }

  function handleUserStateUpdate (tags: Record<string, any>): void {
    hooks.userStateUpdate.trigger({
      name: tags?.['display-name'],
      color: tags?.color,
      emoteSets: tags?.['emote-sets'],

      messageId: tags?.id,
      nonce: tags?.['client-nonce'],
      badges: tags?.badges,
    });
  }

  function handleChatMessage (message: ParsedIrcMessage): void {
    if (message.text === undefined) {
      log.warning(log.Type.Irc, 'Tried to handle chat message, but its text was empty', message);
      return;
    }

    const chatMessage: ChatMessage = {
      id: message.tags?.id,
      author: message.tags?.['display-name'],
      color: message.tags?.color,
      badges: message.tags?.badges,
      text: message.text,
      localEmotesMap: message.tags?.emotes,
    };

    hooks.messageReceived.trigger(chatMessage);
  }

  function logMessage (message: ParsedIrcMessage): void {
    const logData = [];

    logData.push(message.command);

    if (message.channel !== undefined) {
      logData.push(message.channel);
    }

    if (message.text !== undefined) {
      logData.push(message.text);
    }

    log.message(log.Type.Irc, logData.join(' '));
  }

  function handleServiceMessage (message: ParsedIrcMessage): void {
    logMessage(message);

    hooks.serviceMessageReceived.trigger({
      command: message.command,
      text: message.text,
    });
  }

  function handleWorkerMessage (source: string): void {
    const rawMessages = source.trim().split(/\n/);

    rawMessages.forEach((rawMessage: string) => {
      const message = parseMessage(rawMessage);

      if (message === undefined) {
        return;
      }

      /**
       * If we received message about successfull connection to IRC,
       * run messages queue, stored in worker
       */
      if (message.command === IrcCommand.Connect) {
        handleConnection();
        logMessage(message);

        return;
      }

      /**
       * If we received message about user's state,
       * trigger according hook to save it
       */
      if (message.command === IrcCommand.GlobalUserState || message.command === IrcCommand.UserState) {
        if (message.tags !== undefined) {
          handleUserStateUpdate(message.tags);
        }

        return;
      }

      /**
       * If we received chat message,
       * trigger according hook to process and display it
       */
      if (message.command === IrcCommand.Message) {
        handleChatMessage(message);

        return;
      }

      /**
       * At this point we need to handle all other messages
       */
      handleServiceMessage(message);

      /**
       * @todo Handle ROOMSTATE command
       * @todo handle NOTICE command
       */
    });
  }

  return {
    connect,
    disconnect,
    join,
    leave,
    send,

    onMessageReceived: hooks.messageReceived.on,
    offMessageReceived: hooks.messageReceived.off,

    onUserStateUpdated: hooks.userStateUpdate.on,
    offUserStateUpdated: hooks.userStateUpdate.off,

    onServiceMessageReceived: hooks.serviceMessageReceived.on,
    offServiceMessageReceived: hooks.serviceMessageReceived.off,
  };
});
