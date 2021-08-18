import type { MainProcessApi } from '../hub';

declare global {
  interface Window {
    hub: MainProcessApi;
  }

  interface WorkerMessageData {
    action: string;
    data: Record<string, any>;
  }
}
