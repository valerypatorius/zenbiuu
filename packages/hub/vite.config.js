import { join } from 'path';
import { builtinModules } from 'module';
import { defineConfig } from 'vite';

const root = __dirname;
const isDev = process.env.MODE === 'development';

export default defineConfig({
  root,
  resolve: {
    alias: {
      '@/src/': join(root, 'src') + '/',
      '@/types/': join(root, '../../', 'types') + '/',
      '@/store/': join(root, '../../', 'store') + '/',
    },
  },
  build: {
    sourcemap: isDev ? 'inline' : false,
    target: 'chrome100',
    outDir: 'dist',
    assetsDir: '.',
    minify: isDev ? false : 'esbuild',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
  },
});
