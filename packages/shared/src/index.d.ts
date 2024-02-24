/**
 * Do not use imports or exports, as augmentation will not work due to Vite's implementation
 */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWITCH_APP_CLIENT_ID: string;
  readonly VITE_GOODGAME_APP_CLIENT_ID: string;
  readonly VITE_APP_REDIRECT_URL: string;
  readonly VITE_TWITCH_STREAM_CLIENT_ID: string;
  readonly VITE_DEV_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
