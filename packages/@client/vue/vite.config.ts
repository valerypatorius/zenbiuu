import { join } from 'node:path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

export default defineConfig({
  root,
  resolve: {
    alias: {
      '~': join(root, 'src'),
    },
  },
  plugins: [vue(), vueJsx()],
  build: {
    target: 'chrome100',
    assetsDir: '.',
    chunkSizeWarningLimit: 1000,
  },
});
