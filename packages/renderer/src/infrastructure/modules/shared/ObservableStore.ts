import * as localforage from 'localforage';
import { observable } from '@/utils/object';

type Observer<S extends Record<string, any>> = (state: S) => void;

const store = localforage.createInstance({
  driver: localforage.INDEXEDDB,
  name: 'store',
  storeName: 'v2',
});

/**
 * Store with observable and immutable state
 */
export default class ObservableStore<S extends Record<string, any>, O extends Observer<S> = Observer<S>> {
  /**
   * Store name
   */
  readonly #name: string;

  /**
   * Raw non-proxied state object
   */
  readonly #state: S;

  /**
   * Proxied state object, available for public use.
   * Triggers observers when changed
   */
  protected readonly stateProxy: S;

  /**
   * Set of observers functions, which are called on every state change
   */
  readonly #observers = new Set<O>();

  protected constructor (name: string, data: S) {
    this.#name = name;

    this.#state = data;

    this.stateProxy = observable(this.#state, () => {
      this.#observers.forEach((fn) => {
        fn(this.state);
      });

      void ObservableStore.saveStateToStore(this.#name, this.#state);
    });
  }

  /**
   * Returns immutable state copy for external usage
   */
  public get state (): S {
    return Object.freeze(Object.assign({}, this.stateProxy));
  }

  /**
   * Subscribe to state changes by calling specified function
   * @param fn - called on state object updates
   * @returns Function to unsubscribe from changes
   */
  public observe (fn: O): () => void {
    this.#observers.add(fn);

    return () => {
      this.unobserve(fn);
    };
  }

  /**
   * Unubscribe from state changes
   * @param fn - previously called function
   */
  public unobserve (fn: O): void {
    this.#observers.delete(fn);
  }

  static async prepare <S extends Record<string, any>>(name: string, defaultData: S): Promise<{ name: string; data: S }> {
    const storedData = await ObservableStore.getStateFromStore<S>(name);
    const data = storedData ?? defaultData;

    if (storedData === null) {
      await ObservableStore.saveStateToStore(name, defaultData);
    }

    return {
      name,
      data,
    };
  }

  /**
   * Save state in store
   */
  static async saveStateToStore <T>(name: string, state: T): Promise<void> {
    await store.setItem(name, state);
  }

  /**
   * Returns state, previously saved in store
   */
  static async getStateFromStore <T>(name: string): Promise<T | null> {
    const state = await store.getItem<T>(name);

    return state;
  }
}
