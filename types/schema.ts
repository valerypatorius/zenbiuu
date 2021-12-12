import { AppColorScheme } from './color';
import { AppLocaleName } from './renderer/locale';
import { PlayerLayout } from './renderer/player';
import { StreamType, TwitchStream, TwitchUser, TwitchUserFollow, Sorting } from './renderer/library';
import type { ChatEmote, ChatMessage } from './renderer/chat';

/**
 * Filenames for electron-store files
 */
export enum StoreFilename {
  Config = 'config',
  Library = 'library',
}

/**
 * Vuex store modules names
 */
export enum Module {
  App = 'app',
  Chat = 'chat',
  User = 'user',
  Library = 'library',
  Player = 'player',
  Sidebar = 'sidebar',
  Theme = 'theme',
}

/**
 * Available app settings
 */
export interface AppSettings {
  isAlwaysOnTop: boolean;
  isBlurEnabled: boolean;
}

/**
 * Modules data structure
 */
export interface ModulesSchema {
  [Module.Theme]: {
    name: AppColorScheme;
  };
  [Module.App]: {
    locale: AppLocaleName | null;
    isLoading: boolean;
    isSettings: boolean;
    settings: AppSettings;
    interfaceSize: number;
  };
  [Module.Chat]: {
    messages: ChatMessage[];
    emotes: {
      twitch: Record<string, ChatEmote>;
      bttv: Record<string, ChatEmote>;
      ffz: Record<string, ChatEmote>;
      seventv: Record<string, ChatEmote>;
    };
    width: number;
    height: number;
    isPaused: boolean;
  };
  [Module.User]: {
    token: string | null;
    tokenDate: number;
    id: string | null;
    name: string | null;
  };
  [Module.Library]: {
    followed: TwitchUserFollow[];
    streams: {
      [StreamType.Followed]: TwitchStream[];
      [StreamType.Found]: TwitchStream[];
    };
    users: TwitchUser[];
    lastUpdateTime: number;
    isReady: boolean;
    sorting: Sorting;
  };
  [Module.Player]: {
    volume: number;
    compressor: boolean;
    isHideSidebar: boolean;
    isHideChat: boolean;
    layout: PlayerLayout;
  };
  [Module.Sidebar]: {
    width: number;
  };
}

/**
 * Root non-modules store structure
 */
export interface RootSchema {
  clientId: string;
  redirectUrl: string;
}

/**
 * General store structure.
 * Used by electron-store and Vuex
 */
export type Schema = ModulesSchema & {
  windowBounds: {
    width: number;
    height: number;
  };
};

/**
 * Root state structure.
 * Used in Vuex actions
 */
export type RootState = Partial<ModulesSchema> & RootSchema;

/**
 * Store module structure constructor.
 * Used in Vuex modules
 */
export type ModuleState<K extends Module> = Schema[K];

/**
 * Default store state
 */
export const schema: Schema = {
  windowBounds: {
    width: 1280,
    height: 800,
  },
  [Module.Theme]: {
    name: AppColorScheme.System,
  },
  [Module.App]: {
    locale: null,
    isLoading: false,
    isSettings: false,
    settings: {
      isAlwaysOnTop: false,
      isBlurEnabled: true,
    },
    interfaceSize: 10,
  },
  [Module.Chat]: {
    messages: [],
    emotes: {
      twitch: {},
      bttv: {},
      ffz: {},
      seventv: {},
    },
    width: 300,
    height: 500,
    isPaused: false,
  },
  [Module.User]: {
    token: null,
    tokenDate: 0,
    id: null,
    name: null,
  },
  [Module.Library]: {
    followed: [],
    streams: {
      followed: [],
      found: [],
    },
    users: [],
    lastUpdateTime: 0,
    isReady: false,
    sorting: Sorting.ViewersDesc,
  },
  [Module.Player]: {
    volume: 0.25,
    compressor: false,
    isHideSidebar: false,
    isHideChat: false,
    layout: PlayerLayout.Horizontal,
  },
  [Module.Sidebar]: {
    width: 300,
  },
};
