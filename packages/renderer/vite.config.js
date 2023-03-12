import { join } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const root = __dirname;
const isDev = process.env.MODE === 'development';

export default defineConfig({
  root,
  resolve: {
    alias: {
      '@/src': join(root, 'src'),
      '@/types': join(root, '../../', 'types'),
      '@/assets': join(root, 'assets'),
      '@/hub/types': join(root, '../', 'hub/src/types'),

      /** @see https://github.com/video-dev/hls.js/issues/5146 */
      'hls.js': 'hls.js/dist/hls.min.js',
    },
  },
  plugins: [
    vue({
      reactivityTransform: true,
    }),
  ],
  base: '',
  server: {
    fsServe: {
      root: join(root, '../../'),
    },
  },
  build: {
    sourcemap: isDev,
    target: 'chrome100',
    outDir: 'dist',
    assetsDir: '.',
    minify: isDev ? false : 'esbuild',
    emptyOutDir: true,
  },
});
