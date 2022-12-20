import { reactive, watch, computed } from 'vue';
import { createSharedComposable, useWebWorker } from '@vueuse/core';
import { useUser } from '../store/useUser';
import { Method } from '@/src/workers/types.request.worker';
import RequestWorker from '@/src/workers/request.worker.ts?worker';
import { useInterface } from '../store/useInterface';
import log from './log';

enum RequestError {
  Queued = 'Request still processing',
}

interface QueueHandlers {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

export const useRequest = createSharedComposable(() => {
  const worker = new RequestWorker();

  const { data: workerData, post: postMessage } = useWebWorker(worker);
  const { state: userState } = useUser();
  const { state: interfaceState } = useInterface();

  const queue = reactive(new Map<string, QueueHandlers>());

  const requestHeaders = computed<Record<string, string>>(() => ({
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
    const url = new URL(workerData.value.url);

    if (promise === undefined) {
      return;
    }

    if (workerData.value.error) {
      log.warning(log.Type.Request, `${url.hostname}${url.pathname}`, workerData.value.error);

      promise.reject(workerData.value.error);
    } else {
      log.message(log.Type.Request, `${url.hostname}${url.pathname}`);

      promise.resolve(workerData.value.data);
    }

    queue.delete(workerData.value.url);
  });

  function get<T> (url: string, headers = requestHeaders.value): Promise<T> {
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
            headers,
          },
        },
      });
    });
  }

  function post<T> (url: string, data?: any, headers = requestHeaders.value): Promise<T> {
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
        action: Method.Post,
        data: {
          url,
          body: typeof data === 'string' ? data : JSON.stringify(data),
          options: {
            headers,
          },
        },
      });
    });
  }

  return {
    get,
    post,
    isLoading,
  };
});
