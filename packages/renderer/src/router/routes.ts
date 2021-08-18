import { RouteRecordRaw } from 'vue-router';
import Auth from '@/src/views/Auth.vue';
import Library from '@/src/views/Library.vue';
import Channel from '@/src/views/Channel.vue';
import i18n from '@/src/i18n';
import { RouteName } from '@/types/renderer/router';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: RouteName.Auth,
    component: Auth,
    meta: {
      title: () => i18n.global.t('router.auth'),
    },
  },
  {
    path: '/library',
    name: RouteName.Library,
    component: Library,
    meta: {
      title: () => i18n.global.t('router.library'),
    },
  },
  {
    path: '/channel/:name/:id',
    name: RouteName.Channel,
    component: Channel,
  },
];

export default routes;
