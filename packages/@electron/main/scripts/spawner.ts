#!/usr/bin/env tsx

import { spawn } from 'child_process';
import consola from 'consola';
import electron from 'electron';

interface ElectronProcessHandlers {
  /**
   * Called when electron.exe is stopped, except before restart
   */
  onClose?: () => void;
}

interface ElectronProcessManager {
  start: () => void;
  stop: (signal?: NodeJS.Signals) => void;
  restart: () => void;
  readonly isRunning: boolean;
}

/**
 * Signal sent when electron process is killed before restart.
 * Should be different from "SIGINT", so that parent script process won't be interrupted
 */
const RESTART_SIGNAL = 'SIGKILL';

/**
 * Provides control over electron process process
 */
export function createElectronProcess(handlers?: ElectronProcessHandlers): ElectronProcessManager {
  /**
   * Electron import in node returns path to electron process and we're fine with it
   */
  const electronPath = electron as unknown as string;

  /**
   * Currently active electron process
   */
  let electronProcess: ReturnType<typeof spawn> | undefined;

  function handleCloseEvent(code: number | null, signal: NodeJS.Signals | null): void {
    /**
     * If electron process is being killed after package rebuild, do not stop script
     */
    if (signal === RESTART_SIGNAL) {
      return;
    }

    handlers?.onClose?.();
  }

  function start(isInitial = true): void {
    if (electronProcess !== undefined) {
      return;
    }

    electronProcess = spawn(electronPath, [
      '.',
      '--inspect',
    ]);

    electronProcess.on('close', handleCloseEvent);

    if (isInitial) {
      consola.success('Start electron process');
    }
  }

  function stop(signal?: NodeJS.Signals): void {
    if (electronProcess === undefined) {
      return;
    }

    if (signal === RESTART_SIGNAL) {
      consola.info('Restart electron process');
    }

    electronProcess.kill(signal);

    electronProcess = undefined;
  }

  function restart(): void {
    const isInitialStart = electronProcess === undefined;

    stop(RESTART_SIGNAL);
    start(isInitialStart);
  }

  return {
    start,
    stop,
    restart,
    get isRunning() {
      return electronProcess !== undefined;
    },
  };
}
