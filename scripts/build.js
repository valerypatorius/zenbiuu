#!/usr/bin/node

const { build } = require('vite');
const { dirname } = require('path');

const packagesConfigs = [
  'packages/hub/vite.config.js',
  'packages/main/vite.config.js',
  'packages/renderer/vite.config.js',
];

const buildByConfig = (configFile) => build({
  configFile,
  mode: 'production',
});

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
