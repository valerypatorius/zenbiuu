/**
 * Create debounced function, which delays invoking provided function
 * until at least specified delay has elapsed since its last invocation
 * @param fn - function to call
 * @param delay - delay in ms
 */
export function debounce<T extends (...args: Parameters<T>) => void> (this: ThisParameterType<T>, fn: T, delay = 0): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
