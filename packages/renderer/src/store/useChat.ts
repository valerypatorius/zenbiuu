import { ref } from 'vue';
import { createGlobalState, toReactive } from '@vueuse/core';
import { config } from '@/src/utils/hub';
import { Module, ModulesSchema } from '@/types/schema';
import { useUser } from './useUser';
import irc, { COMMANDS as IRC_COMMANDS } from '@/src/utils/irc';
import { getColorForChatAuthor } from '@/src/utils/color';
import request from '@/src/utils/request';
import type {
  ChatMessage,
  BttvChannelEmotes,
  BttvEmoteDataDefault,
  BttvEmoteDataShared,
  BttvGlobalEmotes,
  FfzChannelEmotes,
  FfzEmoteDataSimple,
  SevenTvEmoteDataSimple,
  SevenTvEmotes,
} from '@/types/renderer/chat';

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

  const { state: userState } = useUser();

  init();

  async function init (): Promise<void> {
    refState.value = await config.get(Module.Chat);

    // watch(state, () => {
    //   config.set(Module.Player, state);
    // });
  }

  async function join (channel: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      irc.post('join', {
        channel,
      });

      irc.onmessage = (type, message) => {
        switch (type) {
          case IRC_COMMANDS.join:
            clear();
            resolve();
            break;
          case IRC_COMMANDS.message:
            addMessage(message as ChatMessage);
            break;
        }
      };
    });
  }

  function leave (channel: string): void {
    clear();

    irc.post('leave', {
      channel,
    });

    irc.onmessage = null;
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

  function getEmotes (channelName: string, channelId: string): void {
    /**
     * BTTV global emotes
     */
    const getBttvGlobal = request.get(ChatEndpoint.BttvGlobal);

    getBttvGlobal.onload = (response: BttvGlobalEmotes) => {
      if (!response || (response.length === 0)) {
        return;
      }

      response.forEach((emote: BttvEmoteDataDefault) => {
        const size = window.devicePixelRatio > 1 ? '2x' : '1x';

        state.emotes.bttv[emote.code] = {
          url: `https://cdn.betterttv.net/emote/${emote.id}/${size}`,
          height: 28,
        };
      });
    };

    /**
     * BTTV channel emotes
     */
    const getBttvChannel = request.get(`${ChatEndpoint.BttvChannel}/${channelId}`);

    getBttvChannel.onload = (data: BttvChannelEmotes) => {
      const { channelEmotes, sharedEmotes } = data;
      const emotes = [...channelEmotes, ...sharedEmotes];

      if (emotes.length === 0) {
        return;
      }

      emotes.forEach((emote: BttvEmoteDataDefault | BttvEmoteDataShared) => {
        const size = window.devicePixelRatio > 1 ? '2x' : '1x';

        state.emotes.bttv[emote.code] = {
          url: `https://cdn.betterttv.net/emote/${emote.id}/${size}`,
          height: 28,
        };
      });
    };

    /** FFZ channel emotes */
    const getFfzChannel = request.get(`${ChatEndpoint.FfzChannel}/${channelName}`);

    getFfzChannel.onload = (response: FfzChannelEmotes) => {
      Object.values(response.sets).forEach((set) => {
        set.emoticons.forEach((emote: FfzEmoteDataSimple) => {
          const size = window.devicePixelRatio > 1 ? 2 : 1;
          const url = emote.urls[size] || emote.urls[1];

          state.emotes.ffz[emote.name] = {
            url: `https:${url}`,
            height: emote.height,
          };
        });
      });
    };

    /** 7tv global emotes */
    const get7tvGlobal = request.get(ChatEndpoint.SevenTvGlobal);

    get7tvGlobal.onload = (response: SevenTvEmotes) => {
      if (!response || (response.length === 0)) {
        return;
      }

      response.forEach((emote: SevenTvEmoteDataSimple) => {
        const size = window.devicePixelRatio > 1 ? '2x' : '1x';

        state.emotes.seventv[emote.name] = {
          url: `https://cdn.7tv.app/emote/${emote.id}/${size}`,
          height: 28,
        };
      });
    };

    /** 7tv channel emotes */
    const get7tvChannel = request.get(`${ChatEndpoint.SevenTvChannel}/${channelName}/emotes`);

    get7tvChannel.onload = (response: SevenTvEmotes) => {
      if (!Array.isArray(response)) {
        return;
      }

      if (!response || (response.length === 0)) {
        return;
      }

      response.forEach((emote: SevenTvEmoteDataSimple) => {
        const size = window.devicePixelRatio > 1 ? '2x' : '1x';

        state.emotes.seventv[emote.name] = {
          url: `https://cdn.7tv.app/emote/${emote.id}/${size}`,
          height: 28,
        };
      });
    };
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
