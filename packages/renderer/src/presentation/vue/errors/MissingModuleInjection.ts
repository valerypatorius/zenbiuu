import { type InjectionKey } from 'vue';

export default class MissingModuleInjection<T> extends Error {
  constructor(moduleKey: InjectionKey<T>) {
    super();

    this.message = 'Missing module injection';
    this.cause = moduleKey;
  }
}
