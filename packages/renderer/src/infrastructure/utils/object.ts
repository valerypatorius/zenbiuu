import { debounce } from './debounce';

/**
 * Returns proxy version of provided object, which will react to object changes
 * @param target - target object
 * @param callback - called on object modifications
 */
export function observable<T extends object> (target: T, callback: () => void, isReuseCallback = false): T {
  /**
   * Wrap callback in debounce function for two reasons:
   * - it will be called after target object updates;
   * - helps to avoid unnecessary simultaneous calls;
   */
  const debouncedCallback = isReuseCallback ? callback : debounce(callback, 0);

  return new Proxy(target, {
    get (...args) {
      const value = Reflect.get(...args);

      if (
        value !== null &&
        typeof value === 'object' &&
        ['Array', 'Object'].includes(value.constructor.name)
      ) {
        /**
         * Make nested objects observable too and specify
         * that provided callback should be used instead of creating a new one
         */
        return observable(value, debouncedCallback, true);
      }

      return value;
    },

    set (...args) {
      debouncedCallback();

      return Reflect.set(...args);
    },

    defineProperty (...args) {
      debouncedCallback();

      return Reflect.defineProperty(...args);
    },
  });
}
