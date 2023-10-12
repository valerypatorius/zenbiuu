/**
 * Remove value from  array, if it is present in it
 * @param arr - array to remove value from
 * @param value - value to remove
 */
export function removeFromArray<T> (arr: T[], value: T): void {
  const index = arr.indexOf(value);

  if (index >= 0) {
    arr.splice(index, 1);
  }
}

/**
 * Clear an array
 * @param arr - array to clear
 */
export function clearArray<T> (arr: T[]): void {
  arr.length = 0;
}

export function statefulArray<T> (arr: T[]): {
  state: T[];
  set: (value: T[]) => void;
  add: (value: T) => void;
  remove: (value: T) => void;
  clear: () => void;
} {
  return {
    state: arr,
    set (value) {
      this.clear();
      this.state.push(...value);
    },
    add (value) {
      removeFromArray(this.state, value);
      this.state.push(value);
    },
    remove (value) {
      removeFromArray(this.state, value);
    },
    clear () {
      clearArray(this.state);
    },
  };
}
