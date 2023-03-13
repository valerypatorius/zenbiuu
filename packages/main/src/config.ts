import Store from 'electron-store';
import type { NativeTheme } from 'electron';

interface Schema {
  windowBounds: {
    width: number;
    height: number;
  };
  theme: NativeTheme['themeSource'];
}

const CONFIG_FILE_NAME = 'config';

const defaultConfig: Schema = {
  windowBounds: {
    width: 1280,
    height: 720,
  },
  theme: 'system',
};

export const config = new Store<Schema>({
  name: CONFIG_FILE_NAME,
  defaults: defaultConfig,
});
