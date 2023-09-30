export default interface InterceptedLink {
  method: string;
  payload: Record<string, string | boolean | null | undefined>;
}
