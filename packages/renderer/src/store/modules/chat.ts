import { ActionContext } from 'vuex';
import { config } from '@/src/utils/hub';
import { Module, RootState, ModuleState } from '@/types/schema';
import { getColorForChatAuthor } from '@/src/utils/color';
import irc, { COMMANDS as IRC_COMMANDS } from '@/src/utils/irc';
import request from '@/src/utils/request';
import * as endpoints from '../endpoints';
import * as actionType from '../actions';
import {
  ChatMessage,
  BttvChannelEmotes,
  BttvEmoteDataDefault,
  BttvEmoteDataShared,
  BttvGlobalEmotes,
  FfzChannelEmotes,
  FfzEmoteDataSimple,
  SevenTvEmoteDataSimple,
  SevenTvEmotes,
  TwitchEmotesResponse,
  TwitchEmote,
  TwitchEmoteFormat,
  TwitchChannelEmote,
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
          case IRC_COMMANDS.userstate:
          case IRC_COMMANDS.globaluserstate:
            dispatch(actionType.SET_IRC_USERSTATE, message);
            break;
          case IRC_COMMANDS.message:
            dispatch(actionType.ADD_CHAT_MESSAGE, message);
            break;
        }
      };
    });
  },

  /**
   * Set irc state of user
   */
  [actionType.SET_IRC_USERSTATE] (
    { state }: ActionContext<ChatState, RootState>,
    data: ChatState['userState'],
  ) {
    state.userState = data;
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
        // if (messageData.emotes?.[word]) {
        //   const emote = messageData.emotes[word];
        //   const { url, height } = emote;

        //   return `<span class="emote" title="${word}">
        //     <img src="${url}" alt="${word}" style="--height: ${height}px;">
        //   </span>`;
        // }

        if (state.emotes.twitch[word]) {
          const emote = state.emotes.twitch[word];
          const { url, height } = emote;

          return `<span class="emote" title="${word}">
            <img src="${url}" alt="${word}" style="--height: ${height}px;">
          </span>`;
        } else if (state.emotes.bttv[word]) {
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
   * Request chat emotes
   */
  [actionType.REQUEST_CHAT_EMOTES] (
    { state, rootState }: ActionContext<ChatState, RootState>,
    { channelName, channelId }: {channelName: string; channelId: string},
  ): void {
    if (!rootState.user) {
      return;
    }

    /**
     * Twitch global emotes
     */
    const getTwitchGlobal = request.get(endpoints.TWITCH_GLOBAL_EMOTES, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `Bearer ${rootState.user.token}`,
        'Client-ID': rootState.clientId,
      },
    });

    getTwitchGlobal.onload = (response: TwitchEmotesResponse<TwitchEmote>) => {
      if (!response || (response.data.length === 0)) {
        return;
      }

      response.data.forEach((emote: TwitchEmote) => {
        const size = window.devicePixelRatio > 1 ? '2.0' : '1.0';
        const format = emote.format.includes(TwitchEmoteFormat.Animated) ? TwitchEmoteFormat.Animated : TwitchEmoteFormat.Static;

        state.emotes.twitch[emote.name] = {
          url: response.template
            .replace('{{id}}', emote.id)
            .replace('{{format}}', format)
            .replace('{{theme_mode}}', 'dark')
            .replace('{{scale}}', size),
          height: 28,
        };
      });
    };

    /**
     * Twitch channel emotes
     */
    const getTwitchChannel = request.get(`${endpoints.TWITCH_CHANNEL_EMOTES}?broadcaster_id=${channelId}`, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `Bearer ${rootState.user.token}`,
        'Client-ID': rootState.clientId,
      },
    });

    getTwitchChannel.onload = (response: TwitchEmotesResponse<TwitchChannelEmote>) => {
      if (!response || (response.data.length === 0)) {
        return;
      }

      response.data.forEach((emote: TwitchChannelEmote) => {
        const size = window.devicePixelRatio > 1 ? '2.0' : '1.0';
        const format = emote.format.includes(TwitchEmoteFormat.Animated) ? TwitchEmoteFormat.Animated : TwitchEmoteFormat.Static;

        state.emotes.twitch[emote.name] = {
          url: response.template
            .replace('{{id}}', emote.id)
            .replace('{{format}}', format)
            .replace('{{theme_mode}}', 'dark')
            .replace('{{scale}}', size),
          height: 28,
        };
      });
    };

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
