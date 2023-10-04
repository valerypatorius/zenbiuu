import { RequestAction, RequestStatusCode, type RequestWorkerMessage, type RequestResponse, type RequestPayload } from '../types';

const context = self as unknown as Worker;

/**
 * Handle request to a specified url
 * @param method - method for request
 * @param options - payload for request
 */
async function handle (method: string, payload: RequestPayload): Promise<void> {
  const message: RequestResponse = {
    url: payload.url,
  };

  try {
    const response = await fetch(payload.url, {
      method,
      ...payload.options,
    });

    /**
     * If response is not found, do not proceed
     */
    if (response.status === RequestStatusCode.NotFound) {
      throw new Error(`Resource ${payload.url} was not found`, { cause: RequestStatusCode.NotFound });
    }

    /**
     * If authorization is required, do not proceed
     */
    if (response.status === RequestStatusCode.NotAuthorized) {
      throw new Error(`Authorization is required to access ${payload.url}`, { cause: RequestStatusCode.NotAuthorized });
    }

    /**
     * Make response string to check if it can be empty
     */
    const responseText = await response.clone().text();

    /**
     * If response should be parsed as text, return it right away
     */
    if (
      (response.status === RequestStatusCode.Success || response.status === RequestStatusCode.NoContent) &&
      payload.parseResponse === 'text'
    ) {
      message.data = responseText;

      context.postMessage(message);

      return;
    }

    /**
     * If response should be empty and it is, post message and do not proceed
     */
    if (
      (response.status === RequestStatusCode.Success || response.status === RequestStatusCode.NoContent) &&
      responseText.length === 0
    ) {
      context.postMessage(message);

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
    if (response.status === RequestStatusCode.Success && !('error' in responseData)) {
      message.data = responseData;

      context.postMessage(message);
    }

    const errormessage = typeof responseData.message === 'string' ? responseData.message : `Unknown error occured when requesting ${payload.url}`;

    throw new Error(errormessage);
  } catch (error) {
    message.error = error as Error & { cause?: RequestStatusCode };

    context.postMessage(message);
  }
}

context.onmessage = ({ data: messageData }: RequestWorkerMessage) => {
  switch (messageData.action) {
    case RequestAction.Get:
      void handle('GET', messageData.data);
      break;
    case RequestAction.Post:
      void handle('POST', messageData.data);
      break;
  }
};
