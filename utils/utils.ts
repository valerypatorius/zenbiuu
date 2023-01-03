/**
 * Returns unique id
 */
export function uid (): string {
  const rand = Math.random();
  const now = new Date().getTime();

  return rand.toString(36).substring(2, 15) + now.toString(36).substring(2, 15);
}
