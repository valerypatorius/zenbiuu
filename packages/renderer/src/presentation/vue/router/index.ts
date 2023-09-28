import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
// import routes from './routes';
// import { HubApiKey } from '@/hub/types';

// /**
//  * Returns window title based on specified route
//  * @todo move to useHub composable
//  */
// export function getWindowTitle (route: RouteLocationNormalized, isDisplayAppName = false): string {
//   const appName = window[HubApiKey].getState().app.name;
//   const title = typeof route.meta.title === 'function' ? route.meta.title() : route.params.name;

//   if (typeof title !== 'string') {
//     return appName;
//   }

//   let result = title.toString();

//   if (isDisplayAppName) {
//     result = `${result} - ${appName}`;
//   }

//   return result;
// }

// const router = createRouter({
//   history: createWebHashHistory('/'),
//   routes,
// });

// router.afterEach(updateWindowTitle);

const routes: RouteRecordRaw[] = [
  // {
  //   path: '/auth',
  //   name: RouteName.Auth,
  //   component: Auth,
  //   meta: {
  //     title: () => i18n.global.t('router.auth'),
  //   },
  // },
  // {
  //   path: '/library',
  //   name: RouteName.Library,
  //   component: Library,
  //   meta: {
  //     title: () => i18n.global.t('router.library'),
  //   },
  // },
  // {
  //   path: '/channel/:name/:id',
  //   name: RouteName.Channel,
  //   component: Channel,
  // },
];

const router = createRouter({
  history: createWebHashHistory('/'),
  routes,
});

export default router;
