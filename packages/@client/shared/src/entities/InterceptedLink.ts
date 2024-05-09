export interface InterceptedLink {
  method: string;
  payload: Record<string, string | number | boolean | null | undefined>;
}
