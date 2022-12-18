enum RequestError {
  NotFound = 'Not found',
}

const context = self as any as Worker;

const Status = {
  Success: 200,
  NoContent: 204,
  NotFound: 404,
};

/**
 * Perform GET request to specified url
 */
async function get (url: string, options = {}): Promise<void> {
  const method = 'GET';

  try {
    const response = await fetch(url, {
      method,
      ...options,
    });

    if (response.status === Status.NotFound) {
      throw new Error(RequestError.NotFound);
    }

    const data = response.status === Status.NoContent ? {} : await response.json();
    const error = data.error || data.status !== Status.Success ? data.message : false;

    context.postMessage({
      method,
      url,
      data,
      error,
    });
  } catch (error) {
    context.postMessage({
      url,
      error,
    });
  }
}

/**
 * Perform POST request to specified url
 */
async function post (url: string, options = {}, body = ''): Promise<void> {
  const method = 'POST';

  try {
    const response = await fetch(url, {
      method,
      body,
      ...options,
    });

    if (response.status === Status.NotFound) {
      throw new Error(RequestError.NotFound);
    }

    const isEmptyResponse = response.status === Status.NoContent || await response.clone().text() === '';
    const data = isEmptyResponse ? {} : await response.clone().json();
    const error = data.error || data.status !== Status.Success ? data.message : false;

    context.postMessage({
      method,
      url,
      data,
      error,
    });
  } catch (error) {
    context.postMessage({
      url,
      error,
    });
  }
}

context.onmessage = ({ data }: MessageEvent<WorkerMessageData>) => {
  const { url, options, body } = data.data;

  switch (data.action) {
    case 'get':
      get(url, options);
      break;
    case 'post':
      post(url, options, body);
      break;
    default:
  }
};

export {};
