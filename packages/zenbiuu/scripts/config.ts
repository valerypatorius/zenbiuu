import rendererConfig from '@client/vue/config';
import mainConfig from '@electron/main/config';
import preloadConfig from '@electron/preload/config';
import { type InlineConfig, mergeConfig } from 'vite';

type PackagesConfigs = Record<'main' | 'preload' | 'renderer', InlineConfig>;

/**
 * Provides Vite configs composition for each app package
 */
export function createConfig(
  customConfigs?: Partial<PackagesConfigs>,
): PackagesConfigs {
  /**
   * Base config used by every package
   */
  const baseConfig: InlineConfig = {
    configFile: false,
    mode: process.env.NODE_ENV,
    logLevel: process.env.NODE_ENV === 'development' ? 'warn' : undefined,
  };

  const main: InlineConfig = mergeConfig(
    {
      ...mainConfig,
      ...baseConfig,
    },
    customConfigs?.main ?? {},
  );

  const preload: InlineConfig = mergeConfig(
    {
      ...preloadConfig,
      ...baseConfig,
    },
    customConfigs?.preload ?? {},
  );

  const renderer: InlineConfig = mergeConfig(
    {
      ...rendererConfig,
      ...baseConfig,
    },
    customConfigs?.renderer ?? {},
  );

  return {
    main,
    preload,
    renderer,
  };
}
