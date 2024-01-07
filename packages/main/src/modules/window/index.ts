import { join } from 'path';
import { BrowserWindow, shell } from 'electron';
import type WindowInterface from '@/interfaces/Window.interface';
import type StoreInterface from '@/interfaces/Store.interface';

export default class Window implements WindowInterface {
  #instance?: BrowserWindow;

  readonly #url = import.meta.env.MODE === 'development' ? import.meta.env.VITE_DEV_SERVER_URL : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  constructor (
    private readonly store: StoreInterface,
  ) {
  }

  public open (options: Electron.BrowserWindowConstructorOptions = {}): void {
    const { width, height } = this.store.get('windowBounds');

    this.#instance = new BrowserWindow({
      icon: join(__dirname, '../../../build/512x512.png'),
      // show: false,
      width,
      height,
      // frame: false,
      // titleBarStyle: 'hiddenInset',
      // backgroundMaterial: 'none',
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: 'rgba(0, 0, 0, 0)',
        symbolColor: 'rgba(255, 255, 255, 0.4)',
        height: 40,
      },
      webPreferences: {
        preload: join(__dirname, '../../preload/dist/index.cjs'),
      },
      // ...options,
    });

    /**
     * When window is ready, show it
     */
    this.#instance.on('ready-to-show', this.show.bind(this));

    /**
     * Clear references to main window, when it is closed
     */
    this.#instance.on('closed', this.destroy.bind(this));

    /**
     * Update window size in config file
     */
    this.#instance.on('resized', this.handleResize.bind(this));

    this.#instance.webContents.on('will-navigate', Window.interceptUrlLoad);

    void this.#instance.loadURL(this.#url);
  }

  private show (): void {
    // this.#instance?.show();

    if (import.meta.env.MODE === 'development') {
      this.#instance?.webContents.openDevTools();
    }
  }

  public get isMinimized (): boolean {
    return this.#instance?.isMinimized() ?? false;
  }

  public restore (): void {
    this.#instance?.restore();
  }

  public focus (): void {
    this.#instance?.focus();
  }

  /**
   * @todo Emit event to clear external references
   */
  private destroy (): void {
    this.#instance = undefined;
  }

  private handleResize (): void {
    if (this.#instance === undefined) {
      return;
    }

    const { width, height } = this.#instance.getBounds();

    this.store.set('windowBounds', {
      width,
      height,
    });
  }

  public send (channel: string, ...args: any[]): void {
    this.#instance?.webContents.send(channel, ...args);
  }

  public setColor (value: string): void {
    this.#instance?.setBackgroundColor(value);
  }

  private static interceptUrlLoad (event: Electron.Event<Electron.WebContentsWillNavigateEventParams>, url: string): void {
    event.preventDefault();

    void shell.openExternal(url);
  }

  // public destroy (): void {
  //   this.#instance?.off()
  // }
}
