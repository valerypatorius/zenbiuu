import { builtinModules } from 'module';
import { join } from 'path';
import { defineConfig } from 'vite';

const root = __dirname;
const isDev = process.env.MODE === 'development';

/**
 * @todo Try to move from cjs lib build
 */
export default defineConfig({
  root,
  resolve: {
    alias: {
      '@zenbiuu/shared': join(root, '../../packages/shared/src'),
    },
  },
  appType: 'custom',
  build: {
    sourcemap: isDev ? 'inline' : false,
    target: 'node21',
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
