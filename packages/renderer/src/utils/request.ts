import Worker from '@/src/workers/request.worker.ts?worker';
import log from '@/src/utils/log';

interface RequestManagerItem {
  onload?: (...args: any[]) => any;
  onerror?: (...args: any[]) => any;
}

/**
 * Helps to communicate with web worker
 */
class RequestManager {
  worker: Worker;
  list: {
    [key: string]: RequestManagerItem;
  };

  constructor () {
    this.worker = new Worker();
    this.worker.onmessage = this.onWorkerMessage.bind(this);

    this.list = {};
  }

  /**
   * Terminate running worker
   */
  disconnect (): void {
    this.worker.terminate();
  }

  /**
   * Perform GET request.
   * If previous request to specified url is pending, do nothing
   */
  get (url: string, options = {}): RequestManagerItem {
    if (this.list[url]) {
      return this.list[url];
    }

    this.worker.postMessage({
      action: 'get',
      data: {
        url,
        options,
      },
    });

    this.list[url] = {};

    return this.list[url];
  }

  /**
   * Perform GET request.
   * If previous request to specified url is pending, do nothing
   */
  post (url: string, options = {}, body = ''): RequestManagerItem {
    if (this.list[url]) {
      return this.list[url];
    }

    this.worker.postMessage({
      action: 'post',
      data: {
        url,
        options,
        body,
      },
    });

    this.list[url] = {};

    return this.list[url];
  }

  /**
   * Check response for errors and call handler,
   * then remove request url from list
   */
  onWorkerMessage (event: MessageEvent): void {
    const {
      method,
      url,
      data,
      error,
    } = event.data;
    const request = this.list[url];

    if (!request) {
      return;
    }

    if (error && (request.onerror != null)) {
      request.onerror(error);
    }

    if (!error && data && (request.onload != null)) {
      request.onload(data);
    }

    if (error) {
      log.warning(log.Location.RequestManager, method, url, error);
    } else {
      log.message(log.Location.RequestManager, method, url);
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.list[url];
  }
}

const request = new RequestManager();

export default request;
