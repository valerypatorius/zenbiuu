import type { NativeTheme } from 'electron';

export interface ThemeStoreSchema {
  /** Current color scheme */
  name: NativeTheme['themeSource'];
}
