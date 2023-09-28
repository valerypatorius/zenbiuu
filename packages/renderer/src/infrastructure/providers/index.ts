import { type ProvidersInterface, type Provider } from './types';
import { type ProviderApi } from './types/api';

class Providers implements ProvidersInterface {
  public async getApi (provider: Provider): Promise<ProviderApi> {
    try {
      const { default: api } = await import(`./${provider}/index.ts`);

      return api as ProviderApi;
    } catch (error) {
      /**
       * @todo Improve errors handling
       */
      throw Error();
    }
  }
}

const providers = new Providers();

export default providers;
