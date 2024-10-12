import type { NativeTheme } from 'electron';

export interface StoreSchema {
  windowBounds: {
    width: number;
    height: number;
  };
  theme: NativeTheme['themeSource'];
}
