export default interface TransportInterface {
  get: <T>(url: string, options?: RequestInit, parser?: 'text') => Promise<T>;
  post: <T>(url: string, options?: RequestInit, parser?: 'text') => Promise<T>;
}
