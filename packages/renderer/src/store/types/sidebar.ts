export interface SidebarStoreSchema {
  /** Sidebar width */
  width: number;
}

export const SidebarStoreName = 'sidebar';

export const defaultSidebarState: SidebarStoreSchema = {
  width: 300,
};
