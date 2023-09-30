import { type HubMainProcessApi } from '$/interfaces/MainProcessApi.interface';

declare global {
  interface Window {
    hub: HubMainProcessApi;
  }
}
