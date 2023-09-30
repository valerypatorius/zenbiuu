import { type UpdateInfo } from 'electron-updater';

export default interface Updater {
  check: () => Promise<UpdateInfo | undefined>;
  download: () => Promise<string[]>;
  install: () => void;
}
