import { builtinModules } from 'module';
import { join } from 'path';
import { defineConfig } from 'vite';

const root = __dirname;
const isDev = process.env.MODE === 'development';

export default defineConfig({
  root,
  resolve: {
    alias: {
      $: join(root, '../../'),
    },
  },
  build: {
    sourcemap: isDev ? 'inline' : false,
    target: 'chrome100',
    outDir: 'dist',
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
