/**
 * Config for electron-builder
 * @type {import('electron-builder').Configuration}
 * @link https://www.electron.build/configuration/configuration
 */
const config = {
  directories: {
    output: 'dist',
    buildResources: 'build',
  },
  files: [
    'packages/**/dist/**',
  ],
  publish: {
    provider: 'github',
    private: false,
  },
};

module.exports = config;
