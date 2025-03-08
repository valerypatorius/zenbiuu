import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

const root = import.meta.dirname;
const isDev = process.env.NODE_ENV === 'development';

/**
 * @todo Try to move from cjs lib build
 */
export default defineConfig({
  root,
  appType: 'custom',
  build: {
    watch: isDev ? {} : undefined,
    target: 'node21',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron', ...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
      output: {
        entryFileNames: 'main.cjs',
      },
    },
  },
});
