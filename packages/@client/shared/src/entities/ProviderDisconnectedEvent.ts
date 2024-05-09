import { type ProviderApiInterface } from '../interfaces';

export type ProviderDisconnectedEvent = CustomEvent<{
  provider: string;
  token: string;
  api: ProviderApiInterface;
}>;
