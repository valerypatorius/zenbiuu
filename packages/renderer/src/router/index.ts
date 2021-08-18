import { callWindowMethod } from '@/src/utils/hub';
import { getAppName } from '@/src/utils/utils';
import { createRouter, createWebHashHistory, RouteLocationNormalized } from 'vue-router';
import routes from '@/src/router/routes';

/**
 * Returns window title based on specified route
 */
export function getWindowTitle (route: RouteLocationNormalized, isDisplayAppName = false): string {
  const title = route.meta.title ? route.meta.title() : (route.params.name || route.name);

  if (title) {
    let result = title.toString();

    if (isDisplayAppName) {
      result = `${result} - ${getAppName()}`;
    }

    return result;
  }

  return getAppName();
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
