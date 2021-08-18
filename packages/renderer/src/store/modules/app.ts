import { ActionContext } from 'vuex';
import { config } from '@/src/utils/hub';
import { Module } from '@/types/schema';
import type { AppSettings, RootState, ModuleState } from '@/types/schema';
import type { AppLocaleName } from '@/types/renderer/locale';
import * as actionType from '../actions';

type AppState = ModuleState<Module.App>;

const defaultState = await config.get('app');

const actions = {
  /**
   * Set "loading" state for app
   */
  [actionType.SET_APP_LOADING] ({ state }: ActionContext<AppState, RootState>, isLoading: boolean): void {
    state.isLoading = isLoading;
  },

  /**
   * Toggle app settings menu state
   */
  [actionType.TOGGLE_APP_SETTINGS] ({ state }: ActionContext<AppState, RootState>): void {
    state.isSettings = !state.isSettings;
  },

  /**
   * Toggle single app setting state.
   * Saved in config file
   */
  [actionType.TOGGLE_APP_SETTING] ({ state }: ActionContext<AppState, RootState>, name: keyof AppSettings): void {
    if (!Object.keys(state.settings).includes(name)) {
      return;
    }

    const currentValue = state.settings[name];

    state.settings[name] = !currentValue;

    config.set(`app.settings.${name.toString()}`, !currentValue);
  },

  /**
   * Set current app locale.
   * Saved in config file
   */
  [actionType.SET_APP_LOCALE] ({ state }: ActionContext<AppState, RootState>, value: AppLocaleName): void {
    state.locale = value;

    config.set('app.locale', value);
  },

  /**
   * Set app interface size.
   * Saved in config file
   */
  [actionType.SET_APP_INTERFACE_SIZE] ({ state }: ActionContext<AppState, RootState>, value: number): void {
    state.interfaceSize = value;

    config.set('app.interfaceSize', value);
  },
};

export default {
  state: defaultState,
  actions,
};
