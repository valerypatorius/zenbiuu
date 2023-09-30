import { nativeTheme, type NativeTheme } from 'electron';
import type ThemeInterface from '@/interfaces/Theme.interface';
import type StoreInterface from '@/interfaces/Store.interface';
import type WindowInterface from '@/interfaces/Window.interface';

export default class Theme implements ThemeInterface {
  constructor (
    private readonly store: StoreInterface,
    private readonly window: WindowInterface,
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
