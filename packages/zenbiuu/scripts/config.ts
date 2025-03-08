import rendererConfig from '@client/vue/config';
import mainConfig from '@electron/main/config';
import preloadConfig from '@electron/preload/config';
import { resolve } from 'node:path';
import { type InlineConfig, mergeConfig } from 'vite';

type PackagesConfigs = Record<'main' | 'preload' | 'renderer', InlineConfig>;

const outDir = resolve(import.meta.dirname, '..', 'dist');
const isDev = process.env.NODE_ENV === 'development';

/**
 * Provides Vite configs composition for each app package
 */
export function createConfig(customConfigs?: Partial<PackagesConfigs>): PackagesConfigs {
  /**
   * Base config used by every package
   */
  const baseConfig: InlineConfig = {
    base: './',
    configFile: false,
    mode: process.env.NODE_ENV,
    logLevel: process.env.NODE_ENV === 'development' ? 'warn' : undefined,
    build: {
      outDir,
      emptyOutDir: false,
      minify: isDev ? false : 'esbuild',
      sourcemap: isDev ? 'inline' : false,
    },
  };

  const main: InlineConfig = mergeConfig(mergeConfig(mainConfig, baseConfig), customConfigs?.main ?? {});

  const preload: InlineConfig = mergeConfig(mergeConfig(preloadConfig, baseConfig), customConfigs?.preload ?? {});

  const renderer: InlineConfig = mergeConfig(mergeConfig(rendererConfig, baseConfig), customConfigs?.renderer ?? {});

  return {
    main,
    preload,
    renderer,
  };
}
