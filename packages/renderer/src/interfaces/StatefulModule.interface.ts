export default interface StatefulModule {
  build: () => Promise<void>;
}
