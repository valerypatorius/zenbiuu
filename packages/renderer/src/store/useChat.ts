import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { getColorForChatAuthor } from '@/src/utils/color';
import { useRequest } from '@/src/infrastructure/request/useRequest';
import { useIrc } from '@/src/infrastructure/irc/useIrc';
import { IrcCommand } from '@/src/infrastructure/irc/types.irc.worker';
import { useStore } from './__useStore';
import { ChatStoreName, defaultChatState } from '@/src/store/types/chat';
import type { ChatMessage, BttvChannelEmotes, BttvGlobalEmotes, FfzChannelEmotes, SevenTvEmotes, ChatEmote } from '@/src/modules/channel/types/chat';

enum ChatEndpoint {
  BttvGlobal = 'https://api.betterttv.net/3/cached/emotes/global',
  BttvChannel = 'https://api.betterttv.net/3/cached/users/twitch',
  FfzChannel = 'https://api.frankerfacez.com/v1/room',
  SevenTvGlobal = 'https://api.7tv.app/v2/emotes/global',
  SevenTvChannel = 'https://api.7tv.app/v2/users',
}

/**
 * Max number of messages in chat
 */
const LIMIT = 200;

export const useChat = createSharedComposable(() => {
  const { state } = useStore(ChatStoreName, defaultChatState);
  const { get } = useRequest();
  const { join: joinChannel, leave: leaveChannel, onMessage, offMessage } = useIrc();
  const messages = ref<ChatMessage[]>([]);
  const isPaused = ref(false);

  const customEmotes = useIDBKeyval<Record<string, ChatEmote>>('emotes', {}, {
    shallow: true,
  });

  function messageHandler ({ command, data }: { command: IrcCommand; data?: ChatMessage }): void {
    switch (command) {
      case IrcCommand.Join:
        clear();
        break;
      case IrcCommand.Message:
        addMessage(data as ChatMessage);
        break;
    }
  }

  async function join (channelName: string): Promise<void> {
    joinChannel(channelName);
    onMessage(messageHandler);
  }

  function leave (channel: string): void {
    clear();

    leaveChannel(channel);
    offMessage(messageHandler);
  }

  function addMessage (messageData: ChatMessage): void {
    const emotedText = messageData.text.value
      .split(' ')
      .map((word: string) => {
        if (messageData.emotes?.[word] !== undefined) {
          const { url, height } = messageData.emotes[word];

          return `<span class="emote" title="${word}">
            <img src="${url}" alt="${word}" style="--height: ${height}px;">
          </span>`;
        }

        if (customEmotes.value[word] !== undefined) {
          const { url, height } = customEmotes.value[word];

          return `<span class="emote" title="${word}">
            <img src="${url}" alt="${word}" style="--height: ${height}px;">
          </span>`;
        }

        return word;
      }).join(' ');

    const message: ChatMessage = {
      id: messageData.id,
      author: messageData.author,
      badges: messageData.badges,
      color: getColorForChatAuthor(messageData.color),
      text: {
        value: emotedText,
        isColored: messageData.text.isColored,
      },
    };

    messages.value.push(message);

    if (messages.value.length > LIMIT && !isPaused.value) {
      messages.value.splice(0, messages.value.length - LIMIT);
    }
  }

  function clear (): void {
    messages.value = [];
  }

  async function getBttvGlobalEmotes (): Promise<Record<string, ChatEmote>> {
    const response = await get<BttvGlobalEmotes>(ChatEndpoint.BttvGlobal, { headers: undefined });
    const result: Record<string, ChatEmote> = {};

    response.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      result[emote.code] = {
        url: `https://cdn.betterttv.net/emote/${emote.id}/${size}`,
        height: 28,
      };
    });

    return result;
  }

  async function getBttvChannelEmotes (channelId: string): Promise<Record<string, ChatEmote>> {
    const response = await get<BttvChannelEmotes>(`${ChatEndpoint.BttvChannel}/${channelId}`, { headers: undefined });
    const { channelEmotes, sharedEmotes } = response;
    const emotes = [...channelEmotes, ...sharedEmotes];
    const result: Record<string, ChatEmote> = {};

    emotes.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      result[emote.code] = {
        url: `https://cdn.betterttv.net/emote/${emote.id}/${size}`,
        height: 28,
      };
    });

    return result;
  }

  async function getFfzEmotes (channelName: string): Promise<Record<string, ChatEmote>> {
    const response = await get<FfzChannelEmotes>(`${ChatEndpoint.FfzChannel}/${channelName}`, { headers: undefined });
    const result: Record<string, ChatEmote> = {};

    Object.values(response.sets).forEach((set) => {
      set.emoticons.forEach((emote) => {
        const size = window.devicePixelRatio > 1 ? 2 : 1;
        const url = emote.urls[size] ?? emote.urls[1];

        result[emote.name] = {
          url: `https:${url}`,
          height: emote.height,
        };
      });
    });

    return result;
  }

  async function getSevenTvGlobalEmotes (): Promise<Record<string, ChatEmote>> {
    const response = await get<SevenTvEmotes>(ChatEndpoint.SevenTvGlobal, { headers: undefined });
    const result: Record<string, ChatEmote> = {};

    response.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      result[emote.name] = {
        url: `https://cdn.7tv.app/emote/${emote.id}/${size}.webp`,
        height: emote.height[0],
      };
    });

    return result;
  }

  async function getSevenTvChannelEmotes (channelName: string): Promise<Record<string, ChatEmote>> {
    const response = await get<SevenTvEmotes>(`${ChatEndpoint.SevenTvChannel}/${channelName}/emotes`, { headers: undefined });
    const result: Record<string, ChatEmote> = {};

    response.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      result[emote.name] = {
        url: `https://cdn.7tv.app/emote/${emote.id}/${size}.webp`,
        height: emote.height[0],
      };
    });

    return result;
  }

  async function getEmotes ({ id, name }: { id: string; name: string }): Promise<void> {
    const result: Record<string, ChatEmote> = {
      ...await getBttvGlobalEmotes(),
      ...await getBttvChannelEmotes(id),
      ...await getFfzEmotes(name),
      ...await getSevenTvGlobalEmotes(),
      ...await getSevenTvChannelEmotes(name),
    };

    customEmotes.value = result;
  }

  function pause (value: boolean): void {
    isPaused.value = value;
  }

  return {
    state,
    messages,
    join,
    leave,
    clear,
    getEmotes,
    pause,
    isPaused,
  };
});
