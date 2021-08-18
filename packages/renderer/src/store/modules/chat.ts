import { ActionContext } from 'vuex';
import { config } from '@/src/utils/hub';
import { Module, RootState, ModuleState } from '@/types/schema';
import { getColorForChatAuthor } from '@/src/utils/color';
import irc, { COMMANDS as IRC_COMMANDS } from '@/src/utils/irc';
import request from '@/src/utils/request';
import * as endpoints from '../endpoints';
import * as actionType from '../actions';
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

type ChatState = ModuleState<Module.Chat>;

/**
 * Max number of messages in chat
 */
const LIMIT = 200;

const defaultState = await config.get('chat');

const actions = {
  /**
   * Join channel IRC
   */
  [actionType.JOIN_CHANNEL_CHAT] (
    { dispatch, rootState }: ActionContext<ChatState, RootState>,
    {
      channelName,
      channelId,
      userId,
    }: {
      channelName: string;
      channelId: string;
      userId: string;
    },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!rootState.user || !rootState.user.token) {
        return;
      }

      irc.post('join', {
        channel: channelName,
      });

      irc.onmessage = (type, message) => {
        switch (type) {
          case IRC_COMMANDS.join:
            dispatch(actionType.CLEAR_CHAT);
            resolve();
            break;
          case IRC_COMMANDS.message:
            dispatch(actionType.ADD_CHAT_MESSAGE, message);
            break;
        }
      };
    });
  },

  /**
   * Leave channel IRC and stop listening for moderation events
   */
  [actionType.LEAVE_CHANNEL_CHAT] (
    { dispatch, rootState }: ActionContext<ChatState, RootState>,
    {
      channelName,
      channelId,
      userId,
    }: {
      channelName: string;
      channelId: string;
      userId: string;
    },
  ): void {
    dispatch(actionType.CLEAR_CHAT);

    irc.post('leave', {
      channel: channelName,
    });

    irc.onmessage = null;
  },

  /**
   * Add new message to chat
   */
  [actionType.ADD_CHAT_MESSAGE] ({ state }: ActionContext<ChatState, RootState>, messageData: ChatMessage): void {
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
  },

  /**
   * Mark chat message as removed
   */
  [actionType.REMOVE_CHAT_MESSAGE] ({ state }: ActionContext<ChatState, RootState>, removedId: string): void {
    const message = state.messages.find((item) => item.id === removedId);

    if (!message) {
      return;
    }

    message.isRemoved = true;
  },

  /**
   * Remove all messages from chat
   */
  [actionType.CLEAR_CHAT] ({ state }: ActionContext<ChatState, RootState>): void {
    state.messages = [];
  },

  /**
   * Request third-party chat emotes
   */
  [actionType.REQUEST_CHAT_EMOTES] (
    { state }: ActionContext<ChatState, RootState>,
    { channelName, channelId }: {channelName: string; channelId: string},
  ): void {
    /**
     * BTTV global emotes
     */
    const getBttvGlobal = request.get(endpoints.BTTV_GLOBAL_EMOTES);

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
    const getBttvChannel = request.get(`${endpoints.BTTV_CHANNEL_EMOTES}/${channelId}`);

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
    const getFfzChannel = request.get(`${endpoints.FFZ_CHANNEL_EMOTES}/${channelName}`);

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
    const get7tvGlobal = request.get(endpoints.SEVENTV_GLOBAL_EMOTES);

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
    const get7tvChannel = request.get(`${endpoints.SEVENTV_CHANNEL_EMOTES}/${channelName}/emotes`);

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
  },

  /**
   * Set chat paused state.
   * Prevents autoscrolling
   */
  [actionType.SET_CHAT_PAUSE] ({ state }: ActionContext<ChatState, RootState>, value = true): void {
    state.isPaused = value;
  },

  /**
   * Set chat container width in horizontal layout.
   * Saved in config file
   */
  [actionType.SET_CHAT_WIDTH] ({ state }: ActionContext<ChatState, RootState>, value: number): void {
    state.width = value;

    config.set('chat.width', value);
  },

  /**
   * Set chat container width in vertical layout.
   * Saved in config file
   */
  [actionType.SET_CHAT_HEIGHT] ({ state }: ActionContext<ChatState, RootState>, value: number): void {
    state.height = value;

    config.set('chat.height', value);
  },
};

export default {
  state: defaultState,
  actions,
};
