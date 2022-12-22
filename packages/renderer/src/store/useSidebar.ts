import { createSharedComposable } from '@vueuse/core';
import { useStore } from './__useStore';
import { SidebarStoreName, defaultSidebarState } from '@/store/sidebar';

export const useSidebar = createSharedComposable(() => {
  const { state } = useStore(SidebarStoreName, defaultSidebarState);

  return {
    state,
  };
});
