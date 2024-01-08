import { spawn } from 'child_process';
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
 * Signal sent when electron.exe is killed before restart.
 * Should be different from "SIGINT", so that parent script process won't be interrupted
 */
const RESTART_SIGNAL = 'SIGKILL';

/**
 * Provides control over electron.exe process
 */
export function createElectronProcess (handlers?: ElectronProcessHandlers): ElectronProcessManager {
  /**
   * Electron import in node returns path to electron.exe and we're fine with it
   */
  const electronPath = electron as unknown as string;

  /**
   * Currently active electron.exe process
   */
  let electronProcess: ReturnType<typeof spawn> | undefined;

  function handleCloseEvent (code: number | null, signal: NodeJS.Signals | null): void {
    /**
     * If electron process is being killed after package rebuild, do not stop script
     */
    if (signal === RESTART_SIGNAL) {
      return;
    }

    handlers?.onClose?.();
  }

  function start (): void {
    electronProcess = spawn(electronPath, ['.']);

    electronProcess.on('close', handleCloseEvent);
  }

  function stop (signal?: NodeJS.Signals): void {
    if (electronProcess === undefined) {
      return;
    }

    electronProcess.off('close', handleCloseEvent);
    electronProcess.kill(signal);

    electronProcess = undefined;
  }

  function restart (): void {
    stop(RESTART_SIGNAL);
    start();
  }

  return {
    start,
    stop,
    restart,
    get isRunning () {
      return electronProcess !== undefined;
    },
  };
}
