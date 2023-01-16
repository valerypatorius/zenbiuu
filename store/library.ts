import { Sorting } from '../types/renderer/library';

export interface LibraryStoreSchema {
  /** Active library sorting */
  sorting: Sorting;
}

export const LibraryStoreName = 'library';

export const defaultLibraryState: LibraryStoreSchema = {
  sorting: Sorting.ViewersDesc,
};
