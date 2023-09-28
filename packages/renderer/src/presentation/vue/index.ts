import { createApp } from 'vue';
import App from '@/presentation/vue/components/App.vue';
import router from '@/presentation/vue/router';
import i18n from '@/presentation/vue/i18n';

const rootContainerSelector = 'body';

const app = createApp(App);

app.use(i18n);
app.use(router);

app.mount(rootContainerSelector);
