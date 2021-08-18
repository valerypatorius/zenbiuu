import { ActionContext } from 'vuex';
import { config, setNativeTheme } from '@/src/utils/hub';
import { Module, RootState, ModuleState } from '@/types/schema';
import type { AppColorScheme } from '@/types/color';
import * as actionType from '../actions';

type ThemeState = ModuleState<Module.Theme>;

const defaultState = await config.get('theme');

const actions = {
  /**
   * Set app color scheme.
   * Saved in config file
   */
  [actionType.SET_APP_COLOR_SCHEME] ({ state }: ActionContext<ThemeState, RootState>, value: AppColorScheme): void {
    state.name = value;

    config.set('theme.name', value);

    setNativeTheme(value);
  },
};

export default {
  state: defaultState,
  actions,
};
