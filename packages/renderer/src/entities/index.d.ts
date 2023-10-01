import type MainProcessApi from '$/interfaces/MainProcessApi.interface';

declare global {
  interface Window {
    hub: MainProcessApi;
  }
}
