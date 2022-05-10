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
    },
  },
  plugins: [vue()],
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
    minify: isDev ? false : 'terser',
    terserOptions: {
      ecma: 2022,
      compress: {
        passes: 2,
      },
    },
    emptyOutDir: true,
  },
});
