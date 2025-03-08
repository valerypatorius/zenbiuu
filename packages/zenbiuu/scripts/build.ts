import consola from 'consola';
import { build } from 'vite';
import { createConfig } from './config';
import { resolve } from 'node:path';
import builder from 'electron-builder';

const outDir = resolve(import.meta.dirname, '..', 'dist');
const config = createConfig();

try {
  await Promise.all([build(config.main), build(config.preload), build(config.renderer)]);

  await builder.build({
    projectDir: resolve(outDir, '..'),
    targets: builder.Platform.current().createTarget(),
    config: {
      files: 'dist/**',
      directories: {
        output: resolve(outDir, 'build'),
        buildResources: resolve(process.cwd(), 'public'),
      },
      publish: null,
      // publish: {
      //   provider: 'github',
      //   private: false,
      // },
    },
  });

  process.exit(0);
} catch (error) {
  consola.error(error);

  process.exit();
}
