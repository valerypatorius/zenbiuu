import { watch, ref } from 'vue';
import { createEventHook, createSharedComposable, useWebWorker, useDebounceFn, useCounter } from '@vueuse/core';
import IrcWorker from './irc.worker.ts?worker';
import { IrcAction, IrcCloseCode, IrcCommand, type IrcData, type IrcPayload } from './types';
import type { ChatMessage } from '@/src/modules/channel/types/chat';
import { parseMessage, parseText, parseEmotes, parseBadges } from '@/src/utils/irc';
import log from '@/src/utils/log';
import { useUser } from '@/src/modules/auth/useUser';

const IrcEndpoint = 'wss://irc-ws.chat.twitch.tv:443';

export const useIrc = createSharedComposable(() => {
  const worker = new IrcWorker();

  const { data: workerData, post: postMessage } = useWebWorker<IrcData>(worker);
  const { state: userState } = useUser();
  const { count: connectionDelay, set: setConnectionDelay, reset: resetConnectionDelay } = useCounter(100);

  const isConnected = ref(false);
  const messageHook = createEventHook<{ command: IrcCommand; data?: ChatMessage }>();

  watch(workerData, () => {
    /**
     * If received data is a string, assume it is an IRC message,
     * so parse it
     */
    if (typeof workerData.value === 'string') {
      handleMessage(workerData.value);

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

  function handleMessage (raw: string): void {
    const messages = raw.trim().split(/\n/);

    messages.forEach((message: string) => {
      const parsed = parseMessage(message);

      /**
       * Do not proceed if message contains unknown command
       */
      if (!Object.values(IrcCommand).includes(parsed.command as IrcCommand)) {
        return;
      }

      /**
       * If we received message about successfull connection to IRC,
       * run messages queue, stored in worker
       */
      if (parsed.command === IrcCommand.Connect) {
        resetConnectionDelay();

        isConnected.value = true;

        postMessage({
          action: IrcAction.RunQueue,
        });
      }

      /**
       * If we received some service message,
       * log it and trigger message hook, but do not provide any additional data
       */
      if (parsed.command !== IrcCommand.Message) {
        const logData = [];

        logData.push(parsed.command);
        logData.push(parsed.text);
        logData.push(parsed.channel);

        log.message(log.Type.Irc, logData.join(' '));

        messageHook.trigger({
          command: parsed.command as IrcCommand,
        });

        return;
      }

      /**
       * If message tags were not parsed for some reason,
       * simply log it and do not proceed
       */
      if (parsed.tags === null) {
        log.warning(log.Type.Irc, 'Could not parse message', raw);

        return;
      }

      const text = parseText(parsed.text);

      const data: ChatMessage = {
        text,
        id: parsed.tags.id,
        author: parsed.tags['display-name'],
        emotes: parseEmotes(parsed.tags.emotes, text.value),
        badges: parseBadges(parsed.tags.badges),
        color: parsed.tags.color,
      };

      /**
       * At this point we should have fully parsed chat message,
       * ready to be used for display. Trigger message hook and relax
       */
      messageHook.trigger({
        command: parsed.command as IrcCommand,
        data,
      });
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

  return {
    connect,
    disconnect,
    join,
    leave,
    onMessage: messageHook.on,
    offMessage: messageHook.off,
  };
});
