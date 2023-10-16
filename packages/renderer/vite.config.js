import { join } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

const root = __dirname;
const isDev = process.env.MODE === 'development';

export default defineConfig({
  root,
  resolve: {
    alias: {
      $: join(root, '../../'),
      '@/entities': join(root, 'src/entities'),
      '@/interfaces': join(root, 'src/interfaces'),
      '@/assets': join(root, 'assets'),
      '@/hub': join(root, 'src/infrastructure/hub'),
      '@/oauth': join(root, 'src/infrastructure/oauth'),
      '@/transport': join(root, 'src/infrastructure/transport'),
      '@/sockets': join(root, 'src/infrastructure/sockets'),
      '@/providers': join(root, 'src/infrastructure/providers'),
      '@/modules': join(root, 'src/infrastructure/modules'),
      '@/utils': join(root, 'src/utils'),
      '@/presentation': join(root, 'src/presentation'),
    },
  },
  plugins: [
    vue(),
    vueJsx(),
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
