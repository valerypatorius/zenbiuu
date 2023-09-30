import { type NativeTheme } from 'electron';

export default interface StoreSchema {
  windowBounds: {
    width: number;
    height: number;
  };
  theme: NativeTheme['themeSource'];
}
