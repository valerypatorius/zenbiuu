import type { NativeTheme } from 'electron';

export interface ThemeStoreSchema {
  /** Current color scheme */
  name: NativeTheme['themeSource'];
}

export const ThemeStoreName = 'theme';

export const defaultThemeState: ThemeStoreSchema = {
  name: 'system',
};
