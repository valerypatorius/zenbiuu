import { type TransportPayload } from '../types';
import type TransportResponse from '@/entities/TransportResponse';
import TransportStatus from '@/entities/TransportStatus';

const controllersByKey = new Map<string, AbortController>();

/**
 * Handle request to a specified url
 * @param method - method for request
 * @param payload - payload for request
 * @param key - request key, based on url and body
 */
async function handle(method: string, payload: TransportPayload, key: string): Promise<void> {
  const pendingRequest = controllersByKey.get(key);

  if (pendingRequest !== undefined) {
    pendingRequest.abort();
  }

  const message: TransportResponse = {
    key,
    url: payload.url,
  };

  try {
    const controller = new AbortController();

    controllersByKey.set(key, controller);

    const response = await fetch(payload.url, {
      method,
      signal: controller.signal,
      ...payload.options,
    });

    controllersByKey.delete(key);

    /**
     * If response is not found, do not proceed
     */
    if (response.status === TransportStatus.NotFound) {
      throw new Error(`Resource ${payload.url} was not found`, { cause: TransportStatus.NotFound });
    }

    /**
     * If authorization is required, do not proceed
     */
    if (response.status === TransportStatus.NotAuthorized) {
      throw new Error(`Authorization is required to access ${payload.url}`, { cause: TransportStatus.NotAuthorized });
    }

    /**
     * Make response string to check if it can be empty
     */
    const responseText = await response.clone().text();

    /**
     * If response should be parsed as text, return it right away
     */
    if (
      (response.status === TransportStatus.Success || response.status === TransportStatus.NoContent) &&
      payload.parseResponse === 'text'
    ) {
      message.data = responseText;

      self.postMessage(message);

      return;
    }

    /**
     * If response should be empty and it is, post message and do not proceed
     */
    if (
      (response.status === TransportStatus.Success || response.status === TransportStatus.NoContent) &&
      responseText.length === 0
    ) {
      self.postMessage(message);

      return;
    }

    /**
     * Make response data object
     */
    const responseData = await response.clone().json();

    if (responseData === null || responseData === undefined) {
      throw new Error(`Response of ${payload.url} is empty`);
    }

    /**
     * If response is successfull and error field is not present in it,
     * add data to message and post it
     */
    if (response.status === TransportStatus.Success && !('error' in responseData)) {
      message.data = responseData;

      self.postMessage(message);
    }

    const errormessage =
      typeof responseData.message === 'string'
        ? responseData.message
        : `Unknown error occured when requesting ${payload.url}`;

    throw new Error(errormessage);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      message.error = new Error(`User aborted request ${payload.url}`, { cause: TransportStatus.Canceled });
    } else {
      message.error = error as Error;
    }

    self.postMessage(message);
  }
}

self.onmessage = ({
  data: messageData,
}: MessageEvent<{ action: 'get' | 'post'; data: TransportPayload; key: string }>) => {
  switch (messageData.action) {
    case 'get':
      void handle('GET', messageData.data, messageData.key);
      break;
    case 'post':
      void handle('POST', messageData.data, messageData.key);
      break;
  }
};
