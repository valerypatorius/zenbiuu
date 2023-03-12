import { HubApiKey } from '../../../../hub/src/types';

export const {
  app,
  platform,
  setThemeSource,
  callWindowMethod,
  requestAccessToken,
  clearSessionStorage,
} = window[HubApiKey];
