import { createApp } from 'vue';
import { accountModuleKey, appPropertiesKey, authModuleKey, hubKey, providersKey } from './injections';
import App from './components/App.vue';
import router from './router';
import { getI18n } from './i18n';
import Hub from '@/hub/Hub';
import Providers from '@/providers/Providers';
import Auth from '@/modules/auth';
import Account from '@/modules/account';

const hub = new Hub();
const providers = new Providers();

const auth = new Auth(providers, hub);
const account = new Account(providers);

const appProperties = await hub.getAppProperties();

const app = createApp(App);

app.use(getI18n(appProperties.locale));
app.use(router);

app.provide(appPropertiesKey, appProperties);
app.provide(hubKey, hub);
app.provide(providersKey, providers);
app.provide(authModuleKey, auth);
app.provide(accountModuleKey, account);

/**
 * Mount the app
 */
app.mount('body');
