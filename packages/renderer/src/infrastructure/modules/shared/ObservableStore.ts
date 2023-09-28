import { observable } from '@/utils/object';

type Observer<T> = (state: T) => void;

/**
 * Store with observable and immutable state
 */
export default class ObservableStore<T extends object, O extends Observer<T> = Observer<T>> {
  /**
   * Proxy version of state source object, which can call observers, while being changed
   */
  protected readonly observableState: T;

  /**
   * Local storage key, where state should be additionally stored
   */
  protected readonly localStorageKey?: string;

  /**
   * Set of observers functions, which are called on every state changes
   */
  private readonly observers = new Set<O>();

  /**
   * When store is initialized, create proxy version of provided state object
   * @param sourceState - source state object
   * @param localStorageKey - local storage key, where state should be additionally stored
   */
  constructor (sourceState: T, localStorageKey?: string) {
    this.localStorageKey = localStorageKey;

    this.observableState = observable(
      this.tryToGetFromLocalStorage(sourceState),
      () => {
        this.tryToSaveToLocalStorage();

        this.observers.forEach((fn) => {
          fn(this.state);
        });
      });

    this.tryToSaveToLocalStorage();
  }

  /**
   * Save current state to local storage, if key is provided
   */
  private tryToSaveToLocalStorage (): void {
    try {
      if (this.localStorageKey !== undefined && this.localStorageKey.length > 0) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.state));
      }
    } catch (error) {
    }
  }

  /**
   * Returns state, previously saved to local storage, if possible.
   * If no state was found or error occured, returns fallback state
   * @param fallbackState - state to return, if retrieving from local storage did not succeed
   */
  private tryToGetFromLocalStorage (fallbackState: T): T {
    try {
      if (this.localStorageKey !== undefined && this.localStorageKey.length > 0) {
        const stateJson = localStorage.getItem(this.localStorageKey);

        return stateJson === null ? fallbackState : JSON.parse(stateJson);
      }

      return fallbackState;
    } catch (error) {
      return fallbackState;
    }
  }

  /**
   * Returns immutable state object copy for external usage
   */
  public get state (): T {
    return Object.freeze(Object.assign({}, this.observableState));
  }

  /**
   * Subscribe to state changes by calling specified function
   * @param fn - called on state object updates
   * @returns Function to unsubscribe from changes
   */
  public observe (fn: O): () => void {
    this.observers.add(fn);

    return () => {
      this.unobserve(fn);
    };
  }

  /**
   * Unubscribe from state changes
   * @param fn - previously called function
   */
  public unobserve (fn: O): void {
    this.observers.delete(fn);
  }
}
