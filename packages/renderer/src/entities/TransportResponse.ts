export default interface TransportResponse<T = unknown> {
  url: string;
  data?: T;
  error?: Error;
}
