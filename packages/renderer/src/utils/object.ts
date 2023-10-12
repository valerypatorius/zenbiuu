import * as ObservableSlim from 'observable-slim';
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

  return ObservableSlim.create(target, false, () => {
    debouncedCallback();
  }) as T;
}

/**
 * Safely delete property from object
 * @param obj - object which property should be deleted
 * @param property - property name to delete
 */
export function deleteObjectProperty<T extends object> (obj: T, property: keyof T): void {
  if (Object.hasOwn(obj, property)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete obj[property];
  }
}

export function statefulObject<T extends Record<string, unknown>> (obj: T): {
  state: T;
  set: (value: T) => void;
  add: (key: keyof T, value: T[keyof T]) => void;
  remove: (key: keyof T) => void;
  clear: () => void;
} {
  return {
    state: obj,
    set (value) {
      this.clear();
      Object.assign(this.state, value);
    },
    add (key, value) {
      this.state[key] = value;
    },
    remove (key) {
      deleteObjectProperty(this.state, key);
    },
    clear () {
      for (const key in this.state) {
        deleteObjectProperty(this.state, key);
      }
    },
  };
}
