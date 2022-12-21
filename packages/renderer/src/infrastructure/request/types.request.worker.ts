export enum RequestAction {
  Get = 'get',
  Post = 'post',
}

export enum RequestError {
  NotFound = 'Not found',
  Queued = 'Request still processing',
  Unknown = 'Unknown error',
}

export enum RequestStatusCode {
  Success = 200,
  NoContent = 204,
  NotFound = 404,
}

export interface RequestPayload {
  url: string;
  options?: RequestInit;
  body?: string;
}

export interface RequestResponse<T = any> {
  url: string;
  data?: T;
  error?: Error;
}

export type RequestWorkerMessage = MessageEvent<WorkerMessageData<RequestAction, RequestPayload>>;