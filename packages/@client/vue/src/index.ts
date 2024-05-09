import { createApp, reactive } from 'vue';
import localforage from 'localforage';
import { Injection } from './injections';
import App from './components/App.vue';
import { getI18n } from './i18n';
import type { ModuleStateInterface } from '@client/shared';
import { Hub } from '@client/hub';
import { createAccount, createChat, createEmotes, createLibrary, PlatformsManager, EmotesManager } from '@client/core';

async function createReactiveState<S extends object>(name: string, defaultState: S): Promise<ModuleStateInterface<S>> {
  const originalState = (await storage.getItem<S>(name)) ?? defaultState;
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

const app = createApp(App);

app.use(getI18n(appProperties.locale));

app.provide(Injection.AppProperties, appProperties);
app.provide(Injection.Providers, providers);
app.provide(Injection.EmotesProviders, emotesProviders);
app.provide(Injection.Module.Account, account);
app.provide(Injection.Module.Library, library);
app.provide(Injection.Module.Emotes, emotes);
app.provide(Injection.Module.Chat, chat);

app.mount(document.body);
