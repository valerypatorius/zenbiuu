import { build, loadEnv } from 'vite';

/**
 * Include variables from .env file in process.env
 */
Object.assign(process.env, loadEnv(process.env.NODE_ENV, process.cwd()));

try {
  await build({
    mode: process.env.NODE_ENV,
    configFile: 'packages/main/vite.config.ts',
  });

  await build({
    mode: process.env.NODE_ENV,
    configFile: 'packages/preload/vite.config.ts',
  });

  await build({
    mode: process.env.NODE_ENV,
    configFile: 'packages/renderer/vite.config.ts',
  });
} catch (error) {
  console.error(error);

  process.exit(1);
}
