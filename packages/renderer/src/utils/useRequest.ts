import { reactive, watch, computed } from 'vue';
import { createSharedComposable, useWebWorker } from '@vueuse/core';
import { useUser } from '../store/useUser';
import { Method } from '@/src/workers/types.request.worker';
import RequestWorker from '@/src/workers/request.worker.ts?worker';
import { useInterface } from '../store/useInterface';

enum RequestError {
  Queued = 'Request still processing',
}

export const useRequest = createSharedComposable(() => {
  const worker = new RequestWorker();

  const { data: workerData, post: postMessage } = useWebWorker(worker);
  const { state: userState } = useUser();
  const { state: interfaceState } = useInterface();

  const queue = reactive(new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }>());

  const requestHeaders = computed(() => ({
    Accept: 'application/vnd.twitchtv.v5+json',
    Authorization: `Bearer ${userState.token}`,
    'Client-ID': import.meta.env.VITE_APP_CLIENT_ID,
  }));

  const isLoading = computed(() => queue.size > 0);

  watch(isLoading, () => {
    interfaceState.isLoading = isLoading.value;
  });

  watch(workerData, () => {
    const promise = queue.get(workerData.value.url);

    if (promise === undefined) {
      return;
    }

    if (workerData.value.error) {
      console.error(workerData.value.error);

      promise.reject(workerData.value.error);
    } else {
      promise.resolve(workerData.value.data);
    }

    queue.delete(workerData.value.url);
  });

  function get<T> (url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      if (queue.has(url)) {
        reject(RequestError.Queued);

        return;
      }

      queue.set(url, {
        resolve,
        reject,
      });

      postMessage({
        action: Method.Get,
        data: {
          url,
          options: {
            headers: requestHeaders.value,
          },
        },
      });
    });
  }

  return {
    get,
    isLoading,
  };
});
