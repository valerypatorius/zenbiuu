import { watch, ref } from 'vue';
import { createEventHook, createSharedComposable, useWebWorker } from '@vueuse/core';
import IrcWorker from '@/src/workers/irc.worker.ts?worker';
import { ChatMessage } from '@/types/renderer/chat';
import { parseMessage, parseText, parseEmotes, parseBadges } from '@/src/utils/irc';
import log from '@/src/utils/log';

enum IrcEndpoin {
  Chat = 'wss://irc-ws.chat.twitch.tv:443',
}

enum CloseCode {
  Manual = 3000,
  Default = 1005,
  Abnormal = 1006,
};

export enum Command {
  Connect = '001',
  Disconnect = '-1',
  Join = 'JOIN',
  Leave = 'PART',
  Message = 'PRIVMSG',
}

export const useIrc = createSharedComposable(() => {
  const worker = new IrcWorker();

  const { data: workerData, post: postMessage } = useWebWorker(worker);

  const isConnected = ref(false);
  const name = ref<string>();
  const token = ref<string>();

  const messageHook = createEventHook<{ command: Command; data: Record<string, any> | ChatMessage }>();

  watch(workerData, () => {
    if (workerData.value.close === true) {
      isConnected.value = false;

      log.warning(log.Type.Irc, 'Closed');

      const isReconnect = workerData.value.code !== CloseCode.Manual;

      if (isReconnect) {
        setTimeout(() => {
          log.message(log.Type.Irc, 'Reconnecting');

          connect(name.value as string, token.value as string);
        }, 2000);
      }

      return;
    }

    const messages = workerData.value.trim().split(/\n/);

    messages.forEach((message: string) => {
      const parsed = parseMessage(message);

      if (!Object.values(Command).includes(parsed.command as Command)) {
        return;
      }

      /**
       * Run IRC queue, when connected
       */
      if (parsed.command === Command.Connect) {
        isConnected.value = true;

        postMessage({
          action: 'runQueue',
        });
      }

      const data: Record<string, any> | ChatMessage = {};

      /**
       * Prepare chat message data for display
       */
      if (parsed.command === Command.Message) {
        data.text = parseText(parsed.text);

        if (parsed.tags != null) {
          data.id = parsed.tags.id;
          data.author = parsed.tags['display-name'];
          data.emotes = parseEmotes(parsed.tags.emotes, data.text.value);
          data.badges = parseBadges(parsed.tags.badges);
          data.color = parsed.tags.color;
        }
      } else {
        const logData = [];

        if (parsed.command !== Command.Connect) {
          logData.push(parsed.command);
        }

        if (parsed.text) {
          logData.push(parsed.text);
        }

        if (parsed.channel) {
          logData.push(parsed.channel);
        }

        log.message(log.Type.Irc, logData.join(' '));
      }

      messageHook.trigger({
        command: parsed.command as Command,
        data,
      });
    });
  });

  function connect (userName: string, userToken: string): void {
    if (isConnected.value) {
      return;
    }

    name.value = userName;
    token.value = userToken;

    postMessage({
      action: 'connect',
      data: {
        url: IrcEndpoin.Chat,
        token: userToken,
        name: userName,
      },
    });
  }

  function disconnect (): void {
    if (!isConnected.value) {
      return;
    }

    postMessage({
      action: 'disconnect',
      data: {
        code: CloseCode.Manual,
      },
    });
  }

  function join (channel: string): void {
    postMessage({
      action: 'join',
      data: {
        channel,
      },
    });
  }

  function leave (channel: string): void {
    postMessage({
      action: 'leave',
      data: {
        channel,
      },
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
