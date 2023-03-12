import { nativeTheme, NativeTheme } from 'electron';
import { Window } from './window';

class NativeThemeManager {
  /**
   * Returns hex color string for browser window, depending on current theme
   */
  public get windowColor (): string {
    return nativeTheme.shouldUseDarkColors ? '#17181b' : '#f2f1ef';
  }

  /**
   * Set theme source and update window background color
   */
  public setSource (value: NativeTheme['themeSource']): void {
    nativeTheme.themeSource = value;

    Window.Main?.setBackgroundColor(this.windowColor);
  }

  /**
   * Returns current theme properties
   */
  public get (): NativeTheme {
    return nativeTheme;
  }
}

export const theme = new NativeThemeManager();
