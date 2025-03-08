import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

const root = import.meta.dirname;
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  root,
  appType: 'custom',
  build: {
    watch: isDev ? {} : undefined,
    target: 'chrome100',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron', ...builtinModules],
      output: {
        entryFileNames: 'preload.cjs',
      },
    },
  },
});
