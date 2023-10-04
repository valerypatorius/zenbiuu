export interface TransportInterface {
  get: <T>(url: string) => Promise<T>;
  post: <T>(url: string, body?: any) => Promise<T>;
}

export enum RequestAction {
  Get = 'get',
  Post = 'post',
}

export enum RequestStatusCode {
  Success = 200,
  NoContent = 204,
  NotAuthorized = 401,
  NotFound = 404,
}

export interface RequestPayload {
  url: string;
  options?: RequestInit;
  parseResponse?: 'json' | 'text';
}

export interface RequestResponse<T = any> {
  url: string;
  data?: T;
  error?: Error & { cause?: RequestStatusCode };
}

export type RequestWorkerMessage = MessageEvent<{ action: RequestAction; data: RequestPayload }>;
