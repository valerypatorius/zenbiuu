import { createStore } from 'vuex';
import app from './modules/app';
import theme from './modules/theme';
import user from './modules/user';
import chat from './modules/chat';
import player from './modules/player';
import library from './modules/library';
import sidebar from './modules/sidebar';
import { env } from '@/src/utils/hub';

const defaultState = {
  clientId: env.APP_CLIENT_ID,
  redirectUrl: env.REDIRECT_URL,
};

const store = {
  state: defaultState,
  modules: {
    app,
    theme,
    user,
    chat,
    player,
    library,
    sidebar,
  },
};

export default createStore(store);
