export default interface ModuleState<S extends object> {
  state: S;
  save: () => void;
}
