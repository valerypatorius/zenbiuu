import consola from 'consola';
import { build } from 'vite';
import { createConfig } from './config';

const config = createConfig();

try {
  await build(config.main);
  await build(config.preload);
  await build(config.renderer);

  process.exit(0);
} catch (error) {
  consola.error(error);

  process.exit();
}
