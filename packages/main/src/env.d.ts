interface ImportMetaEnv {
  readonly VITE_APP_CLIENT_ID: string;
  readonly VITE_APP_REDIRECT_URL: string;
  readonly VITE_STREAM_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
