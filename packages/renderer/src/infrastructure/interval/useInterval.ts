import { reactive, watch } from 'vue';
import { createSharedComposable, useWebWorker } from '@vueuse/core';
import { uid } from '@/src/utils/utils';
import IntervalWorker from './interval.worker.ts?worker';
import { IntervalData, IntervalHandler, IntervalAction } from './types.interval.worker';

export const useInterval = createSharedComposable(() => {
  const worker = new IntervalWorker();
  const { data: workerData, post: postMessage } = useWebWorker<string>(worker);
  const handlers = reactive(new Map<string, IntervalHandler>());

  watch(workerData, () => {
    void handlers.get(workerData.value)?.();
  });

  function start (handler: IntervalHandler, frequency: number, options?: { immediate?: boolean }): () => void {
    const id = uid();

    const data: IntervalData = {
      id,
      frequency,
      isImmediate: options?.immediate,
    };

    handlers.set(id, handler);

    postMessage({
      action: IntervalAction.Start,
      data,
    });

    return () => {
      stop(id);
    };
  }

  function stop (id: string): void {
    handlers.delete(id);

    postMessage({
      action: IntervalAction.Stop,
      data: {
        id,
      },
    });
  }

  return {
    start,
  };
});
