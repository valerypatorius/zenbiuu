import { ActionContext } from 'vuex';
import { config } from '@/src/utils/hub';
import { Module, RootState, ModuleState } from '@/types/schema';
import * as actionType from '../actions';

type SidebarState = ModuleState<Module.Sidebar>;

const defaultState = await config.get('sidebar');

const actions = {
  /**
   * Set width of sidebar container.
   * Saved in config file
   */
  [actionType.SET_SIDEBAR_WIDTH] ({ state }: ActionContext<SidebarState, RootState>, value: number): void {
    state.width = value;

    config.set('sidebar.width', value);
  },
};

export default {
  state: defaultState,
  actions,
};
