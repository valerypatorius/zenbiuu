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
