import type ModuleStateInterface from '@/interfaces/ModuleState.interface';

type ModuleStateFactoryFn<S extends object> = (name: string, defaultState: S) => Promise<ModuleStateInterface<S>>;

export default ModuleStateFactoryFn;
