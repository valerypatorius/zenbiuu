import { createInterface } from 'readline';
import { createServer, loadEnv, build } from 'vite';
import { createElectronProcess } from './electron';
import { createConfig } from './config';
import { createWatchablePlugin } from './plugins';

/**
 * Development server host
 */
const SERVER_HOST = 'localhost';

/**
 * Development server port
 */
const SERVER_PORT = 5173;

/**
 * Create electron process manager,
 * which will be called on Vite build callbacks
 */
const electron = createElectronProcess({
  onClose: () => {
    process.exit(1);
  },
});

/**
 * Create Vite configs for each package
 */
const config = createConfig({
  main: {
    plugins: [
      createWatchablePlugin(() => {
        /**
         * Either start electron on first build or restart it on each build
         */
        electron.restart();
      }),
    ],
  },
  preload: {
    plugins: [
      createWatchablePlugin(() => {
        /**
         * Restart electron after build, but only if it is already running.
         * Won't be called on initial build, as preload package is being built before main
         */
        if (electron.isRunning) {
          electron.restart();
        }
      }),
    ],
  },
  renderer: {
    server: {
      host: SERVER_HOST,
      port: SERVER_PORT,
    },
  },
});

/**
 * Workaround for Windows, because it doesn't receive SIGINT event
 * @see https://stackoverflow.com/a/14861513
 */
if (process.platform === 'win32') {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

/**
 * Exit process without confirmation
 */
process.on('SIGINT', () => {
  process.exit(1);
});

/**
 * Include variables from .env file in process.env
 */
Object.assign(process.env, loadEnv(process.env.NODE_ENV, process.cwd()));

/**
 * Save server url to env variable.
 * When main process package is built, this url will be loaded on electron window open
 */
process.env.VITE_DEV_SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}/`;

try {
  /**
   * First, make dev server for renderer process package
   */
  const server = await createServer(config.renderer);

  /**
   * Start server. This way HMR will be ready, when we open electron window
   */
  await server.listen();

  /**
   * Second, build preload package.
   * Electron window is not opened yet
   */
  await build(config.preload);

  /**
   * Finally, build main process package.
   * When finished, electron window is opened with dev server url loaded
   */
  await build(config.main);
} catch (error) {
  console.error(error);

  process.exit(1);
}
