import { reactive, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createSharedComposable, useWebWorker } from '@vueuse/core';
import { useHub } from '../hub/useHub';
import RequestWorker from './request.worker.ts?worker';
import { RequestAction, RequestError, type RequestResponse, type RequestPayload, RequestStatusCode } from './types';
import { useUser } from '@/src/modules/auth/useUser';
import log from '@/src/utils/log';
import { RouteName } from '@/src/infrastructure/router/types';

interface QueueHandlers<T = any> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: Error) => void;
}

interface RequestHandlerPayload {
  url: string;
  body?: any;
  options?: RequestInit;
  parseResponse?: RequestPayload['parseResponse'];
}

export const useRequest = createSharedComposable(() => {
  const worker = new RequestWorker();

  const { data: workerData, post: postMessage } = useWebWorker<RequestResponse>(worker);
  const { state: userState, clear: clearUser } = useUser();
  const { state: hubState } = useHub();
  const router = useRouter();

  const queue = reactive(new Map<string, QueueHandlers>());

  const defaultHeaders = computed<Record<string, string>>(() => ({
    Accept: 'application/vnd.twitchtv.v5+json',
    Authorization: `Bearer ${userState.token}`,
    'Client-ID': hubState.clientId,
  }));

  const isLoading = computed(() => queue.size > 0);

  watch(workerData, (data) => {
    const handlers = queue.get(data.url);
    const urlObject = new URL(data.url);

    if (handlers === undefined) {
      return;
    }

    if (data.error !== undefined) {
      log.warning(log.Type.Request, `${urlObject.hostname}${urlObject.pathname}`);

      /**
       * Clear logined user data and open auth screen,
       * if server responded with 401
       */
      if (data.error.cause === RequestStatusCode.NotAuthorized) {
        clearUser();

        void router.replace(RouteName.Auth);
      }

      handlers.reject(data.error);
    } else {
      log.message(log.Type.Request, `${urlObject.hostname}${urlObject.pathname}`);

      handlers.resolve(data.data);
    }

    queue.delete(data.url);
  });

  async function handle<T> (action: RequestAction, payload: RequestHandlerPayload): Promise<T> {
    return await new Promise((resolve, reject) => {
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
        parseResponse: payload.parseResponse ?? 'json',
      };

      data.options = {
        headers: defaultHeaders.value,
        referrerPolicy: 'origin',
        ...payload.options,
      };

      if (action === RequestAction.Post && payload.body !== undefined) {
        data.options.body = typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body);
      }

      postMessage({
        action,
        data,
      });
    });
  }

  async function get<T> (url: string, options?: RequestInit, parseResponse?: RequestPayload['parseResponse']): Promise<T> {
    return await handle<T>(RequestAction.Get, {
      url,
      options,
      parseResponse,
    });
  }

  async function post<T> (url: string, body?: any, options?: RequestInit, parseResponse?: RequestPayload['parseResponse']): Promise<T> {
    return await handle<T>(RequestAction.Post, {
      url,
      body,
      options,
      parseResponse,
    });
  }

  return {
    get,
    post,
    isLoading,
  };
});
