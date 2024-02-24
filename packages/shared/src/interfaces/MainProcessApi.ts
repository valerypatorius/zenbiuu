import { type NativeTheme } from 'electron';
import { type AppProperties } from '../entities/AppProperties';
import { type UpdaterInterface } from './Updater';

export interface MainProcessApiInterface {
  updater: UpdaterInterface;
  getAppProperties: () => Promise<AppProperties>;
  setThemeSource: (value: NativeTheme['themeSource']) => Promise<void>;
  clearSessionStorage: () => void;
  openUrlInBrowser: (url: string) => void;
}
