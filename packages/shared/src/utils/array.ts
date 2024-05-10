/**
 * Remove value from  array, if it is present in it
 * @param arr - array to remove value from
 * @param value - value to remove
 */
export function removeFromArray<T>(arr: T[], value: T): void {
  const index = arr.indexOf(value);

  if (index >= 0) {
    arr.splice(index, 1);
  }
}

/**
 * Clear an array
 * @param arr - array to clear
 */
export function clearArray<T>(arr: T[]): void {
  arr.length = 0;
}

export function statefulArray<T>(arr: T[]): {
  state: T[];
  set: (value: T[]) => void;
  add: (value: T) => void;
  remove: (value: T) => void;
  clear: () => void;
} {
  return {
    state: arr,
    set(value) {
      this.clear();
      this.state.push(...value);
    },
    add(value) {
      removeFromArray(this.state, value);
      this.state.push(value);
    },
    remove(value) {
      removeFromArray(this.state, value);
    },
    clear() {
      clearArray(this.state);
    },
  };
}

/**
 * Returns an object, where array items frequency is recorded
 */
export function getArrayItemsFrequencyMap(arr: string[]): Record<string, number> {
  return arr.reduce<Record<string, number>>((result, value) => {
    result[value] = result[value] !== undefined ? result[value] + 1 : 1;

    return result;
  }, {});
}

/**
 * Returns an array of strings, sorted by these strings frequency
 */
export function sortArrayByFrequency(arr: string[]): string[] {
  return Object.entries(getArrayItemsFrequencyMap(arr))
    .sort((a, b) => b[1] - a[1])
    .map(
      ([
        value,
      ]) => value,
    );
}

/**
 * Chunks an array into smaller arrays of a specified size
 */
export function splitArrayIntoChunks<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
}
