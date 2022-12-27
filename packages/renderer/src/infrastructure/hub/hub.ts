import { HubApiKey } from '@/types/hub';

export const {
  app,
  store,
  platform,
  setNativeTheme,
  callWindowMethod,
  requestAccessToken,
  checkAppUpdates,
  downloadAppUpdate,
  installAppUpdate,
  clearSessionStorage,
} = window[HubApiKey];
