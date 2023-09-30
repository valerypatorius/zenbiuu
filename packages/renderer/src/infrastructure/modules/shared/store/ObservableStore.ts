import * as localforage from 'localforage';
import StoreSaveError from './errors/StoreSaveError';
import StoreGetError from './errors/StoreGetError';
import { observable } from '@/utils/object';

type Observer<T> = (state: T) => void;

/**
 * Store with observable and immutable state
 */
export default abstract class ObservableStore<T extends object, O extends Observer<T> = Observer<T>> {
  /**
   * Store name
   */
  readonly #name: string;

  /**
   * Store instance
   */
  readonly #store: LocalForage;

  /**
   * Raw non-proxied state object
   */
  readonly #state: T;

  /**
   * Proxied state object, available for public use.
   * Triggers observers when changed
   */
  protected readonly stateProxy: T;

  /**
   * Set of observers functions, which are called on every state change
   */
  readonly #observers = new Set<O>();

  /**
   * @param name - store name
   * @param data - initial data for state
   */
  constructor (name: string, data: T) {
    /**
     * Save store name
     */
    this.#name = name;

    /**
     * Create store instance
     */
    this.#store = localforage.createInstance({
      driver: localforage.INDEXEDDB,
      name: 'store',
      storeName: 'v2',
    });

    /**
     * Copy and save initial data as state
     */
    this.#state = Object.assign({}, data);

    /**
     * Make proxied version of state object
     */
    this.stateProxy = observable(this.#state, () => {
      /**
       * Call observers
       */
      this.#observers.forEach((fn) => {
        fn(this.state);
      });

      /**
       * Save state in store
       */
      void this.saveStateToStore();
    });

    /**
     * If data exists in store, update state with it.
     * Otherwise, save state in store
     */
    this.getStateFromStore()
      .then((storedState) => {
        Object.assign(this.stateProxy, storedState);
      })
      .catch(() => {
        void this.saveStateToStore();
      });
  }

  /**
   * Returns immutable state copy for external usage
   */
  public get state (): T {
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

  /**
   * Save current state in store
   */
  private async saveStateToStore (): Promise<void> {
    try {
      await this.#store.setItem(this.#name, this.#state);
    } catch (error) {
      console.error(error);
      throw new StoreSaveError();
    }
  }

  /**
   * Returns state, previously saved in store
   */
  private async getStateFromStore (): Promise<T> {
    try {
      const state = await this.#store.getItem<T>(this.#name);

      if (state === null) {
        throw new StoreGetError();
      }

      return state;
    } catch (error) {
      throw new StoreGetError();
    }
  }
}
