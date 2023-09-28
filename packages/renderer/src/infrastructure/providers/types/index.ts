import { type ProviderApi } from './api';

export enum Provider {
  Twitch = 'Twitch',
  Goodgame = 'GoodGame',
}

export interface ProvidersInterface {
  getApi: (provider: Provider) => Promise<ProviderApi>;
}
