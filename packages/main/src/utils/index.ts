/**
 * Transform all object keys to lowercase and return new object
 * @param obj - object to transform
 */
export function objectKeysToLowercase<K extends string, V> (obj: Record<K, V>): Record<K, V> {
  return Object.keys(obj).reduce<Record<string, any>>((acc, k) => {
    acc[k.toLowerCase()] = obj[k as keyof typeof obj];

    return acc;
  }, {});
}
