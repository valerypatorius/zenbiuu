import { reactive } from 'vue';
import { StateChangeEvent, State as HubState } from '@/types/hub';

export const env = window.hub.env;

export const platform = window.hub.platform;

export const config = window.hub.fs.config;

export const library = window.hub.fs.library;

export const setNativeTheme = window.hub.setNativeTheme;

export const callWindowMethod = window.hub.callWindowMethod;

export const requestAccessToken = window.hub.requestAccessToken;

export const getStringByteLength = window.hub.getStringByteLength;

export const checkAppUpdates = window.hub.checkAppUpdates;

export const downloadAppUpdate = window.hub.downloadAppUpdate;

export const installAppUpdate = window.hub.installAppUpdate;

/**
 * Reactive version of hub state.
 * Used in vue components
 */
export const state: HubState = reactive(window.hub.getState());

/**
 * Listen for hub state updates and update its reactive version
 */
window.addEventListener(StateChangeEvent, (event) => {
  const currentState = (event as CustomEvent).detail.state;

  Object.entries(currentState).forEach(([key, value]) => {
    state[key] = value;
  });
});
