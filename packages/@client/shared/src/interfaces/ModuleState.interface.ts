export interface ModuleStateInterface<S extends object> {
  state: S;
  save: () => void;
}
