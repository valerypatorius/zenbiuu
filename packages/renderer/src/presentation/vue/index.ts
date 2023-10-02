import { createApp } from 'vue';
import { Injection } from './injections';
import App from './components/App.vue';
import router from './router';
import { getI18n } from './i18n';
import Hub from '@/hub/Hub';
import Providers from '@/providers/Providers';
import Account from '@/modules/account';

const hub = new Hub();
const providers = new Providers(hub);

const account = await Account.build(providers);

const appProperties = await hub.getAppProperties();

const app = createApp(App);

app.use(getI18n(appProperties.locale));
app.use(router);

app.provide(Injection.AppProperties, appProperties);
app.provide(Injection.Module.Hub, hub);
app.provide(Injection.Providers, providers);
app.provide(Injection.Module.Account, account);

app.mount('body');
