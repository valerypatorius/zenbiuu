/**
 * Safely delete property from object
 * @param obj - object which property should be deleted
 * @param property - property name to delete
 */
export function deleteObjectProperty<T extends object>(obj: T, property: keyof T): void {
  if (Object.hasOwn(obj, property)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete obj[property];
  }
}

export function statefulObject<T extends Record<string, unknown>>(
  obj: T,
): {
  state: T;
  set: (value: T) => void;
  add: (key: keyof T, value: T[keyof T]) => void;
  remove: (key: keyof T) => void;
  clear: () => void;
} {
  return {
    state: obj,
    set(value) {
      this.clear();
      Object.assign(this.state, value);
    },
    add(key, value) {
      this.state[key] = value;
    },
    remove(key) {
      deleteObjectProperty(this.state, key);
    },
    clear() {
      for (const key in this.state) {
        deleteObjectProperty(this.state, key);
      }
    },
  };
}

export function clearObject<T extends Record<string, unknown>>(obj: T): void {
  Object.keys(obj).forEach((key) => {
    deleteObjectProperty(obj, key);
  });
}
