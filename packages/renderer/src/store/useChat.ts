import { ref } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { config } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';
import { getColorForChatAuthor } from '@/src/utils/color';
import { useRequest } from '../utils/useRequest';
import type { ChatMessage, BttvChannelEmotes, BttvGlobalEmotes, FfzChannelEmotes, SevenTvEmotes } from '@/types/renderer/chat';
import { Command, useIrc } from '../utils/useIrc';

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

export const useChat = createGlobalState(() => {
  const refState = ref<ModulesSchema[Module.Chat]>({
    messages: [],
    emotes: {
      bttv: {},
      ffz: {},
      seventv: {},
    },
    width: 300,
    height: 500,
    isPaused: false,
  });

  const state = toReactive(refState);

  const { get } = useRequest();
  const { join: joinChannel, leave: leaveChannel, onMessage, offMessage } = useIrc();

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.Chat);

    // watch(state, () => {
    //   config.set(Module.Player, state);
    // });
  }

  function messageHandler ({ command, data }: { command: Command; data: ChatMessage | Record<string, any> }): void {
    switch (command) {
      case Command.Join:
        clear();
        break;
      case Command.Message:
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
        if (messageData.emotes?.[word]) {
          const emote = messageData.emotes[word];
          const { url, height } = emote;

          return `<span class="emote" title="${word}">
            <img src="${url}" alt="${word}" style="--height: ${height}px;">
          </span>`;
        }

        if (state.emotes.bttv[word]) {
          const emote = state.emotes.bttv[word];
          const { url, height } = emote;

          return `<span class="emote" title="${word}">
            <img src="${url}" alt="${word}" style="--height: ${height}px;">
          </span>`;
        } else if (state.emotes.ffz[word]) {
          const emote = state.emotes.ffz[word];
          const { url, height } = emote;

          return `<span class="emote" title="${word}">
            <img src="${url}" alt="${word}" style="--height: ${height}px;">
          </span>`;
        } else if (state.emotes.seventv[word]) {
          const emote = state.emotes.seventv[word];
          const { url, height } = emote;

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

    state.messages.push(message);

    if (state.messages.length > LIMIT && !state.isPaused) {
      state.messages.splice(0, state.messages.length - LIMIT);
    }
  }

  function clear (): void {
    state.messages = [];
  }

  async function getBttvGlobalEmotes (): Promise<void> {
    const response = await get<BttvGlobalEmotes>(ChatEndpoint.BttvGlobal, {});

    response.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      state.emotes.bttv[emote.code] = {
        url: `https://cdn.betterttv.net/emote/${emote.id}/${size}`,
        height: 28,
      };
    });
  }

  async function getBttvChannelEmotes (channelId: string): Promise<void> {
    const response = await get<BttvChannelEmotes>(`${ChatEndpoint.BttvChannel}/${channelId}`, {});
    const { channelEmotes, sharedEmotes } = response;
    const emotes = [...channelEmotes, ...sharedEmotes];

    emotes.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      state.emotes.bttv[emote.code] = {
        url: `https://cdn.betterttv.net/emote/${emote.id}/${size}`,
        height: 28,
      };
    });
  }

  async function getFfzChannelEmotes (channelName: string): Promise<void> {
    const response = await get<FfzChannelEmotes>(`${ChatEndpoint.FfzChannel}/${channelName}`, {});

    Object.values(response.sets).forEach((set) => {
      set.emoticons.forEach((emote) => {
        const size = window.devicePixelRatio > 1 ? 2 : 1;
        const url = emote.urls[size] || emote.urls[1];

        state.emotes.ffz[emote.name] = {
          url: `https:${url}`,
          height: emote.height,
        };
      });
    });
  }

  async function getSevenTvGlobalEmotes (): Promise<void> {
    const response = await get<SevenTvEmotes>(ChatEndpoint.SevenTvGlobal, {});

    response.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      state.emotes.seventv[emote.name] = {
        url: `https://cdn.7tv.app/emote/${emote.id}/${size}`,
        height: 28,
      };
    });
  }

  async function getSevenTvChannelEmotes (channelName: string): Promise<void> {
    const response = await get<SevenTvEmotes>(`${ChatEndpoint.SevenTvChannel}/${channelName}/emotes`, {});

    response.forEach((emote) => {
      const size = window.devicePixelRatio > 1 ? '2x' : '1x';

      state.emotes.seventv[emote.name] = {
        url: `https://cdn.7tv.app/emote/${emote.id}/${size}`,
        height: 28,
      };
    });
  }

  function getEmotes ({ id, name }: { id: string; name: string }): void {
    getBttvGlobalEmotes();

    getBttvChannelEmotes(id);
    getFfzChannelEmotes(name);

    getSevenTvGlobalEmotes();
    getSevenTvChannelEmotes(name);
  }

  function pause (value: boolean): void {
    state.isPaused = value;
  }

  function setWidth (value: number): void {
    state.width = value;
  }

  function setHeight (value: number): void {
    state.height = value;
  }

  return {
    state,
    join,
    leave,
    clear,
    getEmotes,
    setWidth,
    setHeight,
    pause,
  };
});
