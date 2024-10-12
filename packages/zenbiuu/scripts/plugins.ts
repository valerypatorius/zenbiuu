import crypto from 'node:crypto';
import type { PluginOption } from 'vite';

/**
 * Returns simple Vite plugin for watchable packages.
 * Such packages are rebuilt on files changes and we need to perform some actions on each rebuild
 */
export function createWatchablePlugin(onBuild?: () => void): PluginOption {
  return {
    /**
     * Plugin name does not matter, so simply generate short random string
     */
    name: crypto.randomBytes(4).toString('hex'),

    /**
     * When build is completed, call external handler
     */
    closeBundle() {
      onBuild?.();
    },
  };
}
