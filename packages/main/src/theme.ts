import { nativeTheme, type NativeTheme } from 'electron';
import { type createStore } from './store';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
