import { HubApiKey } from '../../../../hub/src/types';

export const {
  app,
  platform,
  setThemeSource,
  callWindowMethod,
  waitForRedirect,
  clearSessionStorage,
} = window[HubApiKey];
