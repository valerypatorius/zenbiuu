export interface WindowStoreSchema {
  /** App window width */
  width: number;

  /** App window height */
  height: number;
}

export const WindowStoreName = 'windowBounds';

export const defaultWindowState: WindowStoreSchema = {
  width: 1280,
  height: 720,
};
