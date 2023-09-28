import { RequestAction, type RequestResponse, type RequestPayload, type TransportInterface } from './types';
import TransportWorker from './workers/TransportWorker?worker';

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

export default abstract class Transport implements TransportInterface {
  private readonly queue = new Map<string, QueueHandlers>();

  private headers: Record<string, string> = {};

  private readonly worker = new TransportWorker();

  constructor () {
    this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
  }

  public setHeaders (value: Record<string, string>): void {
    this.headers = {
      ...this.headers,
      ...value,
    };
  }

  private handleWorkerMessage (event: MessageEvent<RequestResponse>): void {
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
  }

  private async handle<T> (action: RequestAction, payload: RequestHandlerPayload): Promise<T> {
    return await new Promise((resolve, reject) => {
      /**
       * @todo Handle with abort controller
       */
      if (this.queue.has(payload.url)) {
        reject(new Error('already queued'));

        return;
      }

      this.queue.set(payload.url, {
        resolve,
        reject,
      });

      const data: RequestPayload = {
        url: payload.url,
        parseResponse: payload.parseResponse ?? 'json',
      };

      data.options = {
        headers: this.headers,
        referrerPolicy: 'origin',
        ...payload.options,
      };

      if (action === RequestAction.Post && payload.body !== undefined) {
        data.options.body = typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body);
      }

      this.worker.postMessage({
        action,
        data,
      });
    });
  }

  public async get<T> (url: string, options?: RequestInit, parseResponse?: RequestPayload['parseResponse']): Promise<T> {
    return await this.handle<T>(RequestAction.Get, {
      url,
      options,
      parseResponse,
    });
  }

  public async post<T> (url: string, body?: any, options?: RequestInit, parseResponse?: RequestPayload['parseResponse']): Promise<T> {
    return await this.handle<T>(RequestAction.Post, {
      url,
      body,
      options,
      parseResponse,
    });
  }
}
