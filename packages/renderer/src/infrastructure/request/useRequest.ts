import { reactive, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createSharedComposable, useWebWorker } from '@vueuse/core';
import { useUser } from '@/src/store/useUser';
import log from '@/src/utils/log';
import RequestWorker from './request.worker.ts?worker';
import { RequestAction, RequestError, RequestResponse, RequestPayload, RequestStatusCode } from './types.request.worker';
import { RouteName } from '@/types/renderer/router';

interface QueueHandlers<T = any> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: Error) => void;
}

interface RequestHandlerPayload {
  url: string;
  body?: any;
  headers?: Record<string, string>;
}

export const useRequest = createSharedComposable(() => {
  const worker = new RequestWorker();

  const { data: workerData, post: postMessage } = useWebWorker<RequestResponse>(worker);
  const { state: userState, clear: clearUser } = useUser();
  const router = useRouter();

  const queue = reactive(new Map<string, QueueHandlers>());

  const defaultHeaders = computed<Record<string, string>>(() => ({
    Accept: 'application/vnd.twitchtv.v5+json',
    Authorization: `Bearer ${userState.token}`,
    'Client-ID': import.meta.env.VITE_APP_CLIENT_ID,
  }));

  const isLoading = computed(() => queue.size > 0);

  watch(workerData, (data) => {
    const handlers = queue.get(data.url);
    const urlObject = new URL(data.url);

    if (handlers === undefined) {
      return;
    }

    if (data.error) {
      log.warning(log.Type.Request, `${urlObject.hostname}${urlObject.pathname}`);

      /**
       * Clear logined user data and open auth screen,
       * if server responded with 401
       */
      if (data.error.cause === RequestStatusCode.NotAuthorized) {
        clearUser();
        router.replace(RouteName.Auth);
      }

      handlers.reject(data.error);
    } else {
      log.message(log.Type.Request, `${urlObject.hostname}${urlObject.pathname}`);

      handlers.resolve(data.data);
    }

    queue.delete(data.url);
  });

  function handle<T> (action: RequestAction, payload: RequestHandlerPayload): Promise<T> {
    return new Promise((resolve, reject) => {
      if (queue.has(payload.url)) {
        reject(RequestError.Queued);

        return;
      }

      queue.set(payload.url, {
        resolve,
        reject,
      });

      const data: RequestPayload = {
        url: payload.url,
      };

      if (action === RequestAction.Post && payload.body !== undefined) {
        data.body = typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body);
      }

      if (payload.headers !== undefined) {
        data.options = {
          headers: payload.headers,
        };
      }

      postMessage({
        action,
        data,
      });
    });
  }

  async function get<T> (url: string, headers = defaultHeaders.value): Promise<T> {
    return await handle<T>(RequestAction.Get, {
      url,
      headers,
    });
  }

  async function post<T> (url: string, body?: any, headers = defaultHeaders.value): Promise<T> {
    return await handle<T>(RequestAction.Post, {
      url,
      body,
      headers,
    });
  }

  return {
    get,
    post,
    isLoading,
  };
});
