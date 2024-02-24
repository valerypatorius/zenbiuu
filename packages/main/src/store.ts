import { type StoreSchema } from '@zenbiuu/shared';
import ElectronStore from 'electron-store';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createStore(): {
  get: <K extends keyof StoreSchema>(key: K) => StoreSchema[K];
  set: <K extends keyof StoreSchema>(key: K, value?: StoreSchema[K]) => void;
} {
  const store = new ElectronStore<StoreSchema>({
    name: 'v2.store',
    defaults: {
      windowBounds: {
        width: 1280,
        height: 720,
      },
      theme: 'system',
    },
  });

  return {
    get: (key) => {
      return store.get(key);
    },
    set: (key, value) => {
      store.set(key, value);
    },
  };
}
