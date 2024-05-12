import { join } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

const root = import.meta.dirname;
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  root,
  resolve: {
    alias: {
      '~': join(root, 'src'),
    },
  },
  plugins: [
    vue(),
    vueJsx(),
  ],
  build: {
    sourcemap: isDev,
    target: 'chrome100',
    outDir: 'dist',
    assetsDir: '.',
    minify: isDev ? false : 'esbuild',
    emptyOutDir: false,
    chunkSizeWarningLimit: 1000,
  },
});
