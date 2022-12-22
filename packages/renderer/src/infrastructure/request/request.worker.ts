import { RequestAction, RequestError, RequestStatusCode, RequestWorkerMessage, RequestResponse, RequestPayload } from './types.request.worker';

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
      body: payload.body,
      ...payload.options,
    });

    /**
     * If response is not found, do not proceed
     */
    if (response.status === RequestStatusCode.NotFound) {
      throw new Error(RequestError.NotFound, {
        cause: RequestStatusCode.NotFound,
      });
    }

    /**
     * If authorization is required, do not proceed
     */
    if (response.status === RequestStatusCode.NotAuthorized) {
      throw new Error(RequestError.NotAuthorized, {
        cause: RequestStatusCode.NotAuthorized,
      });
    }

    /**
     * Make response string to check if it can be empty
     */
    const responseText = await response.clone().text();

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

    /**
     * If response is successfull and error field is not present in it,
     * add data to message and post it
     */
    if (response.status === RequestStatusCode.Success && !responseData.error) {
      message.data = responseData;

      context.postMessage(message);
    }

    throw new Error(responseData.message || RequestError.Unknown);
  } catch (error) {
    message.error = error as Error & { cause?: RequestStatusCode };

    context.postMessage(message);
  }
}

context.onmessage = ({ data: messageData }: RequestWorkerMessage) => {
  switch (messageData.action) {
    case RequestAction.Get:
      handle('GET', messageData.data);
      break;
    case RequestAction.Post:
      handle('POST', messageData.data);
      break;
  }
};
