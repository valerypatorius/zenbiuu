import { AppColorScheme } from '../types/color';

export interface ThemeStoreSchema {
  /** Current color scheme */
  name: AppColorScheme;
}

export const ThemeStoreName = 'theme';

export const defaultThemeState: ThemeStoreSchema = {
  name: AppColorScheme.System,
};
