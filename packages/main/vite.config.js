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
      '@/main/types': join(root, 'src/types'),
      '@/modules': join(root, 'src/modules'),
      '@/utils': join(root, 'src/utils'),
    },
  },
  build: {
    sourcemap: isDev ? 'inline' : false,
    target: 'node19',
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
