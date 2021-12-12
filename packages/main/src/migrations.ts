import ElectronStore from 'electron-store';

export default {
  '1.1.0': (store: ElectronStore) => {
    store.set('chat.emotes.twitch', {});
  },
};
