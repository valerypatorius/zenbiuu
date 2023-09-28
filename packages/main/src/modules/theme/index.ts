import { nativeTheme, type NativeTheme } from 'electron';
import { type StoreSchema } from 'src/types/store';
import type ElectronStore from 'electron-store';
import type Window from '../window';

export default class Theme {
  constructor (
    private readonly store: ElectronStore<StoreSchema>,
    private readonly window: Window,
  ) {
    this.setSource(this.store.get('theme'));
  }

  /**
   * Set theme source and update window background color
   */
  public setSource (value: NativeTheme['themeSource']): void {
    nativeTheme.themeSource = value;

    // this.window.setColor(this.windowColor);
  }

  /**
   * Returns hex color string for browser window, depending on current theme
   */
  public get windowColor (): string {
    return nativeTheme.shouldUseDarkColors ? '#121212' : '#ffffff';
  }
}
