import type { UpdateInfo } from 'electron-updater';

export interface UpdaterInterface {
  check: () => Promise<UpdateInfo | undefined>;
  download: () => Promise<string[]>;
  install: () => void;
}
