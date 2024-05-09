import { type InlineConfig } from 'vite';

type PackagesConfigs = Record<'main' | 'preload' | 'renderer', InlineConfig>;

/**
 * Provides Vite configs composition for each app package
 */
export function createConfig(customConfigs?: Partial<PackagesConfigs>): PackagesConfigs {
  /**
   * Base config used by every package
   */
  const baseConfig: InlineConfig = {
    mode: process.env.NODE_ENV,
    logLevel: 'warn',
  };

  /**
   * Config for packages, which should be rebuild on files changes
   */
  const watchableConfig: InlineConfig = {
    build: {
      watch: {},
    },
  };

  const main: InlineConfig = {
    configFile: 'packages/@electron/main/vite.config.ts',
    ...baseConfig,
    ...watchableConfig,
    ...customConfigs?.main,
  };

  const preload: InlineConfig = {
    configFile: 'packages/@electron/preload/vite.config.ts',
    ...baseConfig,
    ...watchableConfig,
    ...customConfigs?.preload,
  };

  const renderer: InlineConfig = {
    configFile: 'packages/@client/vue/vite.config.ts',
    ...baseConfig,
    ...customConfigs?.renderer,
  };

  return {
    main,
    preload,
    renderer,
  };
}
