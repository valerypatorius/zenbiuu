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
    const message = event.data;
    const handlers = this.queue.get(message.key);

    if (handlers === undefined) {
      return;
    }

    if (message.error !== undefined) {
      handlers.reject(message.error);
    } else {
      handlers.resolve(message.data);
    }

    this.queue.delete(message.url);
  }

  private async handle<T> (action: 'get' | 'post', payload: TransportPayload): Promise<T> {
    return await new Promise((resolve, reject) => {
      const data: TransportPayload = {
        url: payload.url,
        parseResponse: payload.parseResponse,
        options: {
          headers: this.headers,
          referrerPolicy: 'origin',
          ...payload.options,
        },
      };

      const key = Transport.getRequestKey(payload.url, payload.options?.body);

      this.queue.set(key, {
        resolve,
        reject,
      });

      this.worker.postMessage({
        action,
        data,
        key,
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

  static getRequestKey (url: string, body?: BodyInit | null): string {
    let key = url;

    if (body !== null && body !== undefined) {
      key += typeof body === 'string' ? `:${body}` : `:${JSON.stringify(body)}`;
    }

    return key;
  }
}
