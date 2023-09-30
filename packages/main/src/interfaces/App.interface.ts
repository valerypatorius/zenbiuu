export default interface AppInterface {
  isAllowAppStart: boolean;
  start: () => Promise<void>;
  quit: () => void;
}
