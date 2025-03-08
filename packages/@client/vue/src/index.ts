import {
  EmotesManager,
  PlatformsManager,
  createAccount,
  createChat,
  createEmotes,
  createLibrary,
  createSettings,
} from '@client/core';
import { Hub } from '@client/hub';
import type { ModuleStateInterface } from '@client/shared';
import localforage from 'localforage';
import { createApp, reactive } from 'vue';
import App from './components/App.vue';
import { getI18n } from './i18n';
import { Injection } from './injections';

async function createReactiveState<S extends object>(name: string, defaultState: S): Promise<ModuleStateInterface<S>> {
  const savedState = (await storage.getItem<S>(name)) ?? {};
  const originalState = {
    ...defaultState,
    ...savedState,
  };
  const reactiveState = reactive(originalState);

  return {
    state: reactiveState as S,
    save: () => {
      void storage.setItem(name, originalState);
    },
  };
}

const storage = localforage.createInstance({
  driver: localforage.INDEXEDDB,
  name: 'store',
  storeName: 'v2',
});

const hub = new Hub();
const emotesProviders = new EmotesManager();
const providers = new PlatformsManager(hub, emotesProviders);

const appProperties = await hub.getAppProperties();

const account = await createAccount(createReactiveState, { providers });
const library = await createLibrary(createReactiveState, { providers });
const emotes = await createEmotes(createReactiveState, { providers });
const chat = await createChat(createReactiveState, { providers });
const settings = await createSettings(createReactiveState, { hub });

const app = createApp(App);

app.use(getI18n(settings.store.locale ?? appProperties.locale));

app.provide(Injection.AppProperties, appProperties);
app.provide(Injection.Providers, providers);
app.provide(Injection.EmotesProviders, emotesProviders);
app.provide(Injection.Module.Account, account);
app.provide(Injection.Module.Library, library);
app.provide(Injection.Module.Emotes, emotes);
app.provide(Injection.Module.Chat, chat);
app.provide(Injection.Module.Settings, settings);

app.mount(document.body);
