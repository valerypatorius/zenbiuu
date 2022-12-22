import { callWindowMethod } from '@/src/utils/hub';
import { getAppName } from '@/src/utils/utils';
import { createRouter, createWebHashHistory, RouteLocationNormalized } from 'vue-router';
import routes from '@/src/router/routes';

/**
 * Returns window title based on specified route
 */
export function getWindowTitle (route: RouteLocationNormalized, isDisplayAppName = false): string {
  const title = typeof route.meta.title === 'function' ? route.meta.title() : route.params.name;

  if (typeof title !== 'string') {
    return getAppName();
  }

  let result = title.toString();

  if (isDisplayAppName) {
    result = `${result} - ${getAppName()}`;
  }

  return result;
}

/**
 * Update window title based on specified route
 */
export function updateWindowTitle (route: RouteLocationNormalized): void {
  callWindowMethod('setTitle', getWindowTitle(route, true));
}

const router = createRouter({
  history: createWebHashHistory('/'),
  routes,
});

router.afterEach(updateWindowTitle);

export default router;
