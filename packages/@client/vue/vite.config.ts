import { join } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

/**
 * @todo Try to replace with import.meta.dirname
 */
const root = __dirname;
const isDev = process.env.MODE === 'development';

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
  base: '',
  build: {
    sourcemap: isDev,
    target: 'chrome100',
    outDir: 'dist',
    assetsDir: '.',
    minify: isDev ? false : 'esbuild',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
});
