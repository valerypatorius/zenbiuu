import { WindowStoreName, WindowStoreSchema, defaultWindowState } from './window';
import { UserStoreName, UserStoreSchema, defaultUserState } from './user';
import { ThemeStoreName, ThemeStoreSchema, defaultThemeState } from './theme';
import { SidebarStoreName, SidebarStoreSchema, defaultSidebarState } from './sidebar';
import { PlayerStoreName, PlayerStoreSchema, defaultPlayerState } from './player';
import { LibraryStoreName, LibraryStoreSchema, defaultLibraryState } from './library';
import { ChatStoreName, ChatStoreSchema, defaultChatState } from './chat';
import { AppStoreName, AppStoreSchema, defaultAppState } from './app';

export interface Schema {
  [WindowStoreName]: WindowStoreSchema;
  [UserStoreName]: UserStoreSchema;
  [ThemeStoreName]: ThemeStoreSchema;
  [SidebarStoreName]: SidebarStoreSchema;
  [PlayerStoreName]: PlayerStoreSchema;
  [LibraryStoreName]: LibraryStoreSchema;
  [ChatStoreName]: ChatStoreSchema;
  [AppStoreName]: AppStoreSchema;
};

export const StoreFileName = 'store';

export const defaultState = {
  [WindowStoreName]: defaultWindowState,
  [UserStoreName]: defaultUserState,
  [ThemeStoreName]: defaultThemeState,
  [SidebarStoreName]: defaultSidebarState,
  [PlayerStoreName]: defaultPlayerState,
  [LibraryStoreName]: defaultLibraryState,
  [ChatStoreName]: defaultChatState,
  [AppStoreName]: defaultAppState,
};
