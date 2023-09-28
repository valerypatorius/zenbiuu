import { createSharedComposable } from '@vueuse/core';
import { type SidebarStoreSchema } from './types';
import { useStore } from '@/src/infrastructure/store/useStore';

export const defaultSidebarState: SidebarStoreSchema = {
  width: 300,
};

export const useSidebar = createSharedComposable(() => {
  const { state } = useStore('sidebar', defaultSidebarState);

  return {
    state,
  };
});
