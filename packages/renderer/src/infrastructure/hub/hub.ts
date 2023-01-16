import { HubApiKey } from '@/types/hub';

export const {
  app,
  store,
  platform,
  setNativeTheme,
  callWindowMethod,
  requestAccessToken,
  clearSessionStorage,
} = window[HubApiKey];
