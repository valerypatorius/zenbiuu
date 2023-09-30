import type StoreSchema from '@/entities/StoreSchema';

export default interface StoreInterface<T = StoreSchema> {
  get: <K extends keyof T>(key: K) => T[K];
  set: <K extends keyof T>(key: K, value?: T[K]) => void;
}
