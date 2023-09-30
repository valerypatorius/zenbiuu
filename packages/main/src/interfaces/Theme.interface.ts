import { type NativeTheme } from 'electron';

export default interface ThemeInterface {
  windowColor: string;
  setSource: (value: NativeTheme['themeSource']) => void;
}
