import { RouteRecordRaw } from 'vue-router';
import Auth from '@/src/modules/auth/Auth.vue';
import Library from '@/src/modules/library/Library.vue';
import Channel from '@/src/modules/channel/Channel.vue';
import i18n from '@/src/infrastructure/i18n/i18n';
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
