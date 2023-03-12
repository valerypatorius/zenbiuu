interface ImportMetaEnv {
  VITE_APP_CLIENT_ID: string;
  VITE_APP_REDIRECT_URL: string;
  VITE_STREAM_CLIENT_ID: string;
}

export const env: ImportMetaEnv = import.meta.env;
