import TransportWorker from './workers/TransportWorker?worker';
import type { TransportPayload } from './types';
import type TransportInterface from '@/interfaces/Transport.interface';
import type TransportResponse from '@/entities/TransportResponse';

interface QueueHandlers<T = any> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: Error) => void;
}

export default class Transport implements TransportInterface {
  private readonly queue = new Map<string, QueueHandlers>();

  private readonly worker = new TransportWorker();

  constructor (
    private readonly headers: Record<string, string>,
  ) {
    this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
  }

  private handleWorkerMessage (event: MessageEvent<TransportResponse>): void {
    const data = event.data;
    const handlers = this.queue.get(data.url);

    if (handlers === undefined) {
      return;
    }

    if (data.error !== undefined) {
      handlers.reject(data.error);
    } else {
      handlers.resolve(data.data);
    }

    this.queue.delete(data.url);
  }

  private async handle<T> (action: 'get' | 'post', payload: TransportPayload): Promise<T> {
    return await new Promise((resolve, reject) => {
      try {
        if (
          action === 'post' &&
          payload.options?.body !== undefined &&
          payload.options.body !== null &&
          typeof payload.options.body !== 'string'
        ) {
          payload.options.body = JSON.stringify(payload.options.body);
        }
      } catch (error) {
        reject(new Error('Failed to prepare body', { cause: payload.options?.body }));

        return;
      }

      const data: TransportPayload = {
        url: payload.url,
        parseResponse: payload.parseResponse,
        options: {
          headers: this.headers,
          referrerPolicy: 'origin',
          ...payload.options,
        },
      };

      this.queue.set(payload.url, {
        resolve,
        reject,
      });

      this.worker.postMessage({
        action,
        data,
      });
    });
  }

  public async get<T> (url: string, options?: RequestInit, parseResponse?: 'text'): Promise<T> {
    return await this.handle<T>('get', {
      url,
      options,
      parseResponse,
    });
  }

  public async post<T> (url: string, options?: RequestInit, parseResponse?: 'text'): Promise<T> {
    return await this.handle<T>('post', {
      url,
      options,
      parseResponse,
    });
  }
}
