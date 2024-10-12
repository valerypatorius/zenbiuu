import { type NativeTheme, nativeTheme } from 'electron';
import type { createStore } from './store';

export function createTheme(store: ReturnType<typeof createStore>) {
  setSource(store.get('theme'));

  /**
   * Set theme source and update window background color
   */
  function setSource(value: NativeTheme['themeSource']): void {
    nativeTheme.themeSource = value;

    // this.window.setColor(this.windowColor);
  }

  return {
    setSource,
    get windowColor() {
      return nativeTheme.shouldUseDarkColors ? '#1d1d22' : '#fefefe';
    },
  };
}
