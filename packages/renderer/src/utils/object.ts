import { createDeepProxy } from '@qiwi/deep-proxy';
import { debounce } from './debounce';

/**
 * Returns proxied version of provided object, which will react to object changes
 * @param target - target object
 * @param callback - called on object modifications
 */
export function observable<T extends object> (target: T, callback: () => void): T {
  /**
   * Wrap callback in debounce function for two reasons:
   * - it will be called after target object updates;
   * - helps to avoid unnecessary simultaneous calls;
   */
  const debouncedCallback = debounce(callback, 0);

  return createDeepProxy(target, ({ trapName, value, DEFAULT, PROXY }) => {
    if (trapName === 'set') {
      debouncedCallback();
    }

    /**
     * Make nested objects observable too
     */
    if (trapName === 'get' && typeof value === 'object' && value !== null) {
      return PROXY;
    }

    return DEFAULT;
  });
}
