import { type NativeTheme, nativeTheme } from 'electron';
import type { createStore } from './store';
import type { createWindow } from './window';

export function createTheme(store: ReturnType<typeof createStore>, window: ReturnType<typeof createWindow>) {
  setSource(store.get('theme'));

  function getWindowColor(): string {
    return nativeTheme.shouldUseDarkColors ? '#1d1d22' : '#fefefe';
  }

  /**
   * Set theme source and update window background color
   */
  function setSource(value: NativeTheme['themeSource']): void {
    nativeTheme.themeSource = value;

    store.set('theme', value);

    window.setColor(getWindowColor());
  }

  return {
    setSource,
    get windowColor() {
      return getWindowColor();
    },
  };
}
