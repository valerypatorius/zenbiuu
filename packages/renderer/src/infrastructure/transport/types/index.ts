export interface TransportPayload {
  url: string;
  options?: RequestInit;
  parseResponse?: 'json' | 'text';
}
