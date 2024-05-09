import { type MainProcessApi } from '@zenbiuu/shared';

declare global {
  interface Window {
    hub: MainProcessApi;
  }
}
