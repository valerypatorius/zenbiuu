#!/usr/bin/node

const { spawn } = require('child_process');
const { createInterface } = require('readline');
const { createServer, build, createLogger, loadEnv } = require('vite');
const electronPath = require('electron');

const LogLevel = {
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
};

const infoLogger = createLogger(LogLevel.Info, {
  prefix: '🐵🔬',
});

const warnLogger = createLogger(LogLevel.Warn, {
  prefix: '🙉🔬',
});

const errorLogger = createLogger(LogLevel.Error, {
  prefix: '🙈🧯',
});

const log = {
  info: (message, config = {}) => {
    infoLogger.info(message, {
      timestamp: true,
      ...config,
    });
  },
  warn: (message, config = {}) => {
    warnLogger.warn(message, {
      timestamp: true,
      ...config,
    });
  },
  error: (message, config = {}) => {
    errorLogger.error(message, {
      timestamp: true,
      ...config,
    });
  },
};

const defaultConfig = {
  mode: 'development',
  build: {
    watch: {},
  },
  logLevel: LogLevel.Warn,
};

const getWatcher = ({ name, configFile, writeBundle }) => {
  return build({
    ...defaultConfig,
    configFile,
    plugins: [{
      name,
      writeBundle,
    }],
  });
};

/**
 * Save dev server url in an environment variable to access it from main process
 */
const setDevServerUrl = (devServer) => {
  const { https, host = 'localhost', port } = devServer.config.server;
  const protocol = https ? 'https' : 'http';

  process.env.VITE_DEV_SERVER_URL = `${protocol}://${host}:${port}/`;
};

/**
 * Start or restart App when source files are changed
 */
const setupMainPackageWatcher = (viteDevServer) => {
  setDevServerUrl(viteDevServer);

  let spawnProcess = null;

  return getWatcher({
    name: 'reload-app-on-main-package-change',
    configFile: 'packages/main/vite.config.js',
    writeBundle () {
      if (spawnProcess !== null) {
        spawnProcess.kill('SIGINT');
        spawnProcess = null;
      }

      /**
       * Spawn electron process
       */
      spawnProcess = spawn(String(electronPath), ['.']);

      /**
       * Exit process when electron window is closed
       */
      spawnProcess.stdout.on('close', () => {
        process.exit(1);
      });

      /**
       * Workaround, because Windows does not simply receive SIGINT event
       * @link https://stackoverflow.com/a/14861513
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

      spawnProcess.stdout.on('data', d => d.toString().trim() && log.warn(d.toString()));
      spawnProcess.stderr.on('data', d => d.toString().trim() && log.error(d.toString()));

      log.info('Open electron window');
    },
  });
};

const setupHubPackageWatcher = (viteDevServer) => {
  return getWatcher({
    name: 'reload-page-on-hub-package-change',
    configFile: 'packages/preload/vite.config.js',
    writeBundle () {
      viteDevServer.ws.send({
        type: 'full-reload',
      });
    },
  });
};

(async () => {
  const {
    npm_package_name: name,
    npm_package_version: version,
  } = process.env;

  log.info(`Start development server for \x1b[33m${name || 'unknown app'} ${version || ''}\x1b[0m`, {
    clear: true,
  });

  try {
    /**
     * Manually load variables defined in .env file
     */
    Object.assign(process.env, loadEnv(defaultConfig.mode, process.cwd()));

    const viteDevServer = await createServer({
      configFile: 'packages/renderer/vite.config.js',
      ...defaultConfig,
    });

    await viteDevServer.listen();
    await setupHubPackageWatcher(viteDevServer);
    await setupMainPackageWatcher(viteDevServer);

    log.info('Watch for files changes');
  } catch (error) {
    log.error(error);

    process.exit(1);
  }
})();
