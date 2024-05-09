export interface TransportResponse<T = unknown> {
  url: string;
  key: string;
  data?: T;
  error?: Error;
}
