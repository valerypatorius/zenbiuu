export default interface StorageInterface {
  setItem: <T>(key: string, value: T) => Promise<T> | T;
  getItem: <T>(key: string) => (T | null) | Promise<T | null>;
}
