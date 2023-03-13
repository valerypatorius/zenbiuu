import { createRouter, createWebHashHistory, type RouteLocationNormalized } from 'vue-router';
import routes from './routes';
import { HubApiKey } from '@/hub/types';

/**
 * Returns window title based on specified route
 * @todo move to useHub composable
 */
export function getWindowTitle (route: RouteLocationNormalized, isDisplayAppName = false): string {
  const appName = window[HubApiKey].getState().app.name;
  const title = typeof route.meta.title === 'function' ? route.meta.title() : route.params.name;

  if (typeof title !== 'string') {
    return appName;
  }

  let result = title.toString();

  if (isDisplayAppName) {
    result = `${result} - ${appName}`;
  }

  return result;
}

/**
 * Update window title based on specified route
 */
export function updateWindowTitle (route: RouteLocationNormalized): void {
  window[HubApiKey].callWindowMethod('setTitle', getWindowTitle(route, true));
}

const router = createRouter({
  history: createWebHashHistory('/'),
  routes,
});

router.afterEach(updateWindowTitle);

export default router;
