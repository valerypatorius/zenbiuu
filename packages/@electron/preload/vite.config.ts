import { builtinModules } from 'module';
import { defineConfig } from 'vite';

const root = import.meta.dirname;
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  root,
  base: './',
  appType: 'custom',
  build: {
    watch: {},
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
    emptyOutDir: false,
  },
});
