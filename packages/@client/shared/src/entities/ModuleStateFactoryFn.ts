import { type ModuleStateInterface } from '../interfaces';

export type ModuleStateFactoryFn<S extends object> = (
  name: string,
  defaultState: S,
) => Promise<ModuleStateInterface<S>>;
