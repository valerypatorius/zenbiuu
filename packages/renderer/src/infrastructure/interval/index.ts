import IntervalWorker from './workers/IntervalWorker?worker';
import { type IntervalPayload } from './types';
import type CallbackFn from '$/entities/CallbackFn';
import { uid } from '@/utils/string';

type StopFn = () => void;

const handlers = new Map<string, CallbackFn>();
const worker = new IntervalWorker();

worker.addEventListener('message', handleWorkerMessage);

function handleWorkerMessage(event: MessageEvent<string>): void {
  const key = event.data;

  const handler = handlers.get(key);

  handler?.();
}

export function createInterval(fn: CallbackFn, delay: number, options: { immediate?: boolean } = {}): StopFn {
  const key = uid();

  const data: IntervalPayload = {
    key,
    delay,
    immediate: options.immediate,
  };

  handlers.set(key, fn);

  worker.postMessage({
    action: 'start',
    data,
  });

  function stop(key: string): void {
    handlers.delete(key);

    worker.postMessage({
      action: 'stop',
      data: {
        key,
      },
    });
  }

  return () => {
    stop(key);
  };
}
