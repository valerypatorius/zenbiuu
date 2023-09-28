#!/usr/bin/node

const { dirname } = require('path');
const { build, loadEnv } = require('vite');

const packagesConfigs = [
  'packages/preload/vite.config.js',
  'packages/main/vite.config.js',
  'packages/renderer/vite.config.js',
];

const buildByConfig = (configFile) => build({
  configFile,
  mode: 'production',
});

/**
 * Manually load variables defined in .env file
 */
Object.assign(process.env, loadEnv('production', process.cwd()));

(async () => {
  try {
    const totalTimeLabel = 'Total bundling time';

    console.time(totalTimeLabel);

    for (const packageConfigPath of packagesConfigs) {
      const consoleGroupName = `${dirname(packageConfigPath)}/`;

      console.group(consoleGroupName);

      const timeLabel = 'Bundling time';

      console.time(timeLabel);

      await buildByConfig(packageConfigPath);

      console.timeEnd(timeLabel);
      console.groupEnd();
      console.log('\n');
    }
    console.timeEnd(totalTimeLabel);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
