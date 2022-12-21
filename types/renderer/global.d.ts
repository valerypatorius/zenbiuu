import type { MainProcessApi } from '../hub';

declare global {
  interface Window {
    hub: MainProcessApi;
  }

  interface WorkerMessageData<ActionType = string, DataType = Record<string, any>> {
    action: ActionType;
    data: DataType;
  }
}
