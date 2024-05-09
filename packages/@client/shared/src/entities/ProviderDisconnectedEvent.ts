import type ProviderApiInterface from '@/interfaces/ProviderApi.interface';

type ProviderDisconnectedEvent = CustomEvent<{
  provider: string;
  token: string;
  api: ProviderApiInterface;
}>;

export default ProviderDisconnectedEvent;
